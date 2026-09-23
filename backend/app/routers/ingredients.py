from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientRead,
    RecipeIngredientCreate,
    RecipeIngredientRead,
)
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[IngredientRead])
def list_ingredients(db: Session = Depends(get_db)):
    return db.query(Ingredient).all()


@router.post("/", response_model=IngredientRead, status_code=201)
def create_ingredient(
    payload: IngredientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ingredient = Ingredient(**payload.model_dump())
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.get("/{recipe_id}/ingredients", response_model=List[RecipeIngredientRead])
def list_recipe_ingredients(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    rows = (
        db.query(RecipeIngredient, Ingredient)
        .join(Ingredient, Ingredient.id == RecipeIngredient.ingredient_id)
        .filter(RecipeIngredient.recipe_id == recipe_id)
        .all()
    )

    return [
        {
            "id": ri.id,
            "recipe_id": ri.recipe_id,
            "ingredient_id": ri.ingredient_id,
            "amount": ri.amount,
            "name": ing.name,
            "unit": ing.unit,
            "category": ing.category,
        }
        for ri, ing in rows
    ]


@router.post("/{recipe_id}/ingredients", response_model=RecipeIngredientRead, status_code=201)
def add_recipe_ingredient(
    recipe_id: int,
    payload: RecipeIngredientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    ingredient = db.query(Ingredient).filter(Ingredient.id == payload.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ингредиент не найден")

    ri = RecipeIngredient(
        recipe_id=recipe_id,
        ingredient_id=payload.ingredient_id,
        amount=payload.amount,
    )
    db.add(ri)
    db.commit()
    db.refresh(ri)

    return {
        "id": ri.id,
        "recipe_id": ri.recipe_id,
        "ingredient_id": ri.ingredient_id,
        "amount": ri.amount,
        "name": ingredient.name,
        "unit": ingredient.unit,
        "category": ingredient.category,
    }