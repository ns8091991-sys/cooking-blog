from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base


class Step(Base):
    __tablename__ = "steps"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, index=True, nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    video_url = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)