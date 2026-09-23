from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa
from app.routers import auth, recipes, steps, ingredients, shopping

app = FastAPI(title="Cooking Blog API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
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