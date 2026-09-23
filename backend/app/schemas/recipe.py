from pydantic import BaseModel
from typing import Optional


class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None


class RecipeRead(RecipeCreate):
    id: int
    author_id: Optional[int] = None

    class Config:
        from_attributes = True