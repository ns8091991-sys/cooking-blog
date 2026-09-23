from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.recipe import Recipe
from app.models.step import Step
from app.schemas.step import StepCreate, StepRead

router = APIRouter()


@router.get("/{recipe_id}/steps", response_model=List[StepRead])
def list_steps(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    return db.query(Step).filter(Step.recipe_id == recipe_id).order_by(Step.order).all()


@router.post("/{recipe_id}/steps", response_model=StepRead, status_code=201)
def create_step(recipe_id: int, payload: StepCreate, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    step = Step(**payload.model_dump(), recipe_id=recipe_id)
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


@router.put("/{recipe_id}/steps/{step_id}", response_model=StepRead)
def update_step(recipe_id: int, step_id: int, payload: StepCreate, db: Session = Depends(get_db)):
    step = db.query(Step).filter(Step.id == step_id, Step.recipe_id == recipe_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Шаг не найден")
    for key, value in payload.model_dump().items():
        setattr(step, key, value)
    db.commit()
    db.refresh(step)
    return step


@router.delete("/{recipe_id}/steps/{step_id}", status_code=204)
def delete_step(recipe_id: int, step_id: int, db: Session = Depends(get_db)):
    step = db.query(Step).filter(Step.id == step_id, Step.recipe_id == recipe_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Шаг не найден")
    db.delete(step)
    db.commit()
    return None