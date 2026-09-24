from pydantic import BaseModel
from datetime import datetime
from app.schemas.recipe import RecipeRead


class FavoriteRead(BaseModel):
    id: int
    recipe_id: int
    created_at: datetime
    recipe: RecipeRead | None = None

    class Config:
        from_attributes = True