from sqlalchemy import Column, Integer, String
from app.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    unit = Column(String, nullable=True)      # "г", "мл", "шт"
    category = Column(String, nullable=True)  # "овощи", "мясо", "бакалея"