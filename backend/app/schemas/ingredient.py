from pydantic import BaseModel
from typing import Optional


class IngredientCreate(BaseModel):
    name: str
    unit: Optional[str] = None
    category: Optional[str] = None


class IngredientRead(IngredientCreate):
    id: int

    class Config:
        from_attributes = True


class RecipeIngredientCreate(BaseModel):
    ingredient_id: int
    amount: float


class RecipeIngredientRead(BaseModel):
    id: int
    recipe_id: int
    ingredient_id: int
    amount: float
    name: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True