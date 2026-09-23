from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.recipe import Recipe
from app.models.shopping_list import ShoppingList, ShoppingItem
from app.models.ingredient import Ingredient
from app.schemas.shopping_list import (
    ShoppingListRequest,
    ShoppingListResponse,
    ShoppingCategoryGroup,
    ShoppingItemRead,
)
from app.services.shopping_service import build_shopping_list
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/preview", response_model=ShoppingListResponse)
def preview_shopping_list(
    payload: ShoppingListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Показать объединённый список без сохранения."""
    if not payload.recipe_ids:
        raise HTTPException(status_code=400, detail="Не выбрано ни одного рецепта")

    # Проверим, что все рецепты существуют
    existing = (
        db.query(Recipe.id)
        .filter(Recipe.id.in_(payload.recipe_ids))
        .all()
    )
    existing_ids = {r[0] for r in existing}
    missing = set(payload.recipe_ids) - existing_ids
    if missing:
        raise HTTPException(status_code=404, detail=f"Рецепты не найдены: {sorted(missing)}")

    groups_raw = build_shopping_list(db, payload.recipe_ids)
    groups = [ShoppingCategoryGroup(**g) for g in groups_raw]
    return ShoppingListResponse(title=payload.title, groups=groups)


@router.post("/", response_model=dict, status_code=201)
def save_shopping_list(
    payload: ShoppingListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Сохранить список покупок для пользователя."""
    if not payload.recipe_ids:
        raise HTTPException(status_code=400, detail="Не выбрано ни одного рецепта")

    groups_raw = build_shopping_list(db, payload.recipe_ids)
    if not groups_raw:
        raise HTTPException(status_code=400, detail="Не найдено ингредиентов")

    # Создаём список
    sl = ShoppingList(user_id=current_user.id, title=payload.title or "Список покупок")
    db.add(sl)
    db.commit()
    db.refresh(sl)

    # Создаём элементы
    for group in groups_raw:
        for item in group["items"]:
            db.add(ShoppingItem(
                list_id=sl.id,
                ingredient_id=item["ingredient_id"],
                amount=item["amount"],
                is_checked=False,
            ))
    db.commit()

    return {"id": sl.id, "title": sl.title, "items_count": sum(len(g["items"]) for g in groups_raw)}


@router.get("/", response_model=List[dict])
def my_shopping_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lists = (
        db.query(ShoppingList)
        .filter(ShoppingList.user_id == current_user.id)
        .order_by(ShoppingList.id.desc())
        .all()
    )
    return [{"id": sl.id, "title": sl.title, "created_at": sl.created_at} for sl in lists]


@router.get("/{list_id}")
def get_shopping_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sl = (
        db.query(ShoppingList)
        .filter(ShoppingList.id == list_id, ShoppingList.user_id == current_user.id)
        .first()
    )
    if not sl:
        raise HTTPException(status_code=404, detail="Список не найден")

    items = (
        db.query(ShoppingItem, Ingredient)
        .join(Ingredient, Ingredient.id == ShoppingItem.ingredient_id)
        .filter(ShoppingItem.list_id == list_id)
        .all()
    )

    return {
        "id": sl.id,
        "title": sl.title,
        "created_at": sl.created_at,
        "items": [
            {
                "id": item.id,
                "ingredient_id": ing.id,
                "name": ing.name,
                "unit": ing.unit,
                "category": ing.category or "разное",
                "amount": item.amount,
                "is_checked": item.is_checked,
            }
            for item, ing in items
        ],
    }


@router.patch("/items/{item_id}")
def toggle_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Элемент не найден")

    # Проверим, что список принадлежит пользователю
    sl = (
        db.query(ShoppingList)
        .filter(ShoppingList.id == item.list_id, ShoppingList.user_id == current_user.id)
        .first()
    )
    if not sl:
        raise HTTPException(status_code=403, detail="Нет доступа")

    item.is_checked = not item.is_checked
    db.commit()
    return {"id": item.id, "is_checked": item.is_checked}