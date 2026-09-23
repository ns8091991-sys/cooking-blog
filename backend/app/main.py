from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa

from app.routers import auth, recipes, steps, ingredients, shopping

app = FastAPI(title="Cooking Blog API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router,    prefix="/api/auth",    tags=["auth"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(steps.router,   prefix="/api/recipes", tags=["steps"])
app.include_router(ingredients.router, prefix="/api/ingredients", tags=["ingredients"])
app.include_router(shopping.router, prefix="/api/shopping-list", tags=["shopping"])


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    from sqlalchemy import inspect
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    print("TABLES AFTER CREATE_ALL:", inspector.get_table_names())


@app.get("/debug/tables")
def debug_tables():
    from sqlalchemy import inspect
    inspector = inspect(engine)
    return {
        "tables": inspector.get_table_names(),
        "database_url": str(engine.url),
    }