from pydantic import BaseModel
from typing import Optional


class StepCreate(BaseModel):
    order: int
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration: Optional[int] = None


class StepRead(StepCreate):
    id: int
    recipe_id: int

    class Config:
        from_attributes = True