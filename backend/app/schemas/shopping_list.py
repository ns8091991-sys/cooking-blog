from pydantic import BaseModel
from typing import List
from app.schemas.ingredient import IngredientRead


class ShoppingListRequest(BaseModel):
    recipe_ids: List[int]
    title: str | None = None


class ShoppingItemRead(BaseModel):
    ingredient_id: int
    name: str
    unit: str | None
    category: str | None
    amount: float


class ShoppingCategoryGroup(BaseModel):
    category: str
    items: List[ShoppingItemRead]


class ShoppingListResponse(BaseModel):
    title: str | None
    groups: List[ShoppingCategoryGroup]