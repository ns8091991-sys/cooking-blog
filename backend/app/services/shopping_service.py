from collections import defaultdict
from sqlalchemy.orm import Session

from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.ingredient import Ingredient


def build_shopping_list(db: Session, recipe_ids: list[int]) -> list[dict]:
    """
    Возвращает список словарей:
    [
      {"category": "овощи", "items": [{"ingredient_id": 1, "name": "Лук", "unit": "г", "amount": 500}, ...]},
      ...
    ]
    """
    # 1. Найти все RecipeIngredient для выбранных рецептов
    rows = (
        db.query(RecipeIngredient, Ingredient)
        .join(Ingredient, Ingredient.id == RecipeIngredient.ingredient_id)
        .filter(RecipeIngredient.recipe_id.in_(recipe_ids))
        .all()
    )

    # 2. Сложить количества по ingredient_id
    totals: dict[int, dict] = {}
    for ri, ing in rows:
        if ing.id not in totals:
            totals[ing.id] = {
                "ingredient_id": ing.id,
                "name": ing.name,
                "unit": ing.unit,
                "category": ing.category or "разное",
                "amount": 0.0,
            }
        totals[ing.id]["amount"] += ri.amount

    # 3. Сгруппировать по категориям
    groups: dict[str, list] = defaultdict(list)
    for item in totals.values():
        groups[item["category"]].append(item)

    # 4. Преобразовать в список
    result = []
    for category, items in sorted(groups.items()):
        items.sort(key=lambda x: x["name"])
        result.append({"category": category, "items": items})

    return result