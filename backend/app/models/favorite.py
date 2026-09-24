from sqlalchemy import Column, Integer, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    recipe_id = Column(Integer, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_user_recipe"),
    )