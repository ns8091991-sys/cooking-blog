from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa — регистрирует модели

from app.routers import auth, recipes, steps, ingredients, shopping, favorites

app = FastAPI(title="Cooking Blog API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",        tags=["auth"])
app.include_router(recipes.router,     prefix="/api/recipes",     tags=["recipes"])
app.include_router(steps.router,       prefix="/api/recipes",     tags=["steps"])
app.include_router(ingredients.router, prefix="/api/ingredients", tags=["ingredients"])
app.include_router(shopping.router,    prefix="/api/shopping-list", tags=["shopping"])
app.include_router(favorites.router,   prefix="/api/favorites",   tags=["favorites"])


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    from sqlalchemy import inspect

    Base.metadata.create_all(bind=engine)

    # Автозаполнение базы, если пусто
    try:
        from app.database import SessionLocal
        from app.models.recipe import Recipe
        db = SessionLocal()
        count = db.query(Recipe).count()
        db.close()

        if count == 0:
            print("SEED: база пуста, наполняем...")
            import subprocess
            import os
            seed_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), "seed.py"
            )
            subprocess.run(["python", seed_path], check=False)
            print("SEED: выполнено")
        else:
            print(f"SEED: пропускаем, в базе {count} рецептов")
    except Exception as e:
        print(f"SEED ERROR: {e}")

    inspector = inspect(engine)
    print("TABLES:", inspector.get_table_names())


@app.get("/debug/tables")
def debug_tables():
    from sqlalchemy import inspect
    inspector = inspect(engine)
    return {
        "tables": inspector.get_table_names(),
        "database_url": str(engine.url),
    }