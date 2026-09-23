from sqlalchemy import Column, Integer, Float
from app.database import Base


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, index=True, nullable=False)
    ingredient_id = Column(Integer, index=True, nullable=False)
    amount = Column(Float, nullable=False)