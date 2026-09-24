from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.favorite import Favorite
from app.models.recipe import Recipe
from app.models.user import User
from app.schemas.favorite import FavoriteRead
from app.schemas.recipe import RecipeRead
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[RecipeRead])
def my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Возвращает список избранных рецептов пользователя."""
    rows = (
        db.query(Recipe)
        .join(Favorite, Favorite.recipe_id == Recipe.id)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return rows


@router.get("/ids")
def my_favorite_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Возвращает только ID избранных рецептов — для проверки на карточках."""
    rows = (
        db.query(Favorite.recipe_id)
        .filter(Favorite.user_id == current_user.id)
        .all()
    )
    return [r[0] for r in rows]


@router.post("/{recipe_id}", status_code=201)
def add_favorite(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Добавить рецепт в избранное."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.recipe_id == recipe_id,
        )
        .first()
    )
    if existing:
        return {"status": "already_exists"}

    fav = Favorite(user_id=current_user.id, recipe_id=recipe_id)
    db.add(fav)
    db.commit()
    return {"status": "added"}


@router.delete("/{recipe_id}", status_code=204)
def remove_favorite(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Убрать рецепт из избранного."""
    fav = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.recipe_id == recipe_id,
        )
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Не в избранном")

    db.delete(fav)
    db.commit()
    return None