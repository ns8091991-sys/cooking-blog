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

@app.get("/debug/register-test")
def debug_register_test():
    import traceback
    from app.database import SessionLocal
    from app.models.user import User

    steps = {}

    try:
        from app.core.security import hash_password
        steps["import_security"] = "ok"
    except Exception as e:
        steps["import_security"] = f"FAIL: {type(e).__name__}: {e}"
        return steps

    try:
        h = hash_password("secret123")
        steps["hash_password"] = f"ok (len={len(h)})"
    except Exception as e:
        steps["hash_password"] = f"FAIL: {type(e).__name__}: {e}"
        steps["hash_traceback"] = traceback.format_exc()

    try:
        from app.schemas.user import UserCreate
        uc = UserCreate(email="debug@test.local", password="secret123", name="Debug")
        steps["pydantic_UserCreate"] = "ok"
    except Exception as e:
        steps["pydantic_UserCreate"] = f"FAIL: {type(e).__name__}: {e}"
        steps["pydantic_traceback"] = traceback.format_exc()

    try:
        db = SessionLocal()
        count = db.query(User).count()
        steps["users_query"] = f"ok (count={count})"
        db.close()
    except Exception as e:
        steps["users_query"] = f"FAIL: {type(e).__name__}: {e}"
        steps["db_traceback"] = traceback.format_exc()

    return steps