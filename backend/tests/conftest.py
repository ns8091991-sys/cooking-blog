"""
Общие фикстуры для тестов.
Используем отдельную тестовую БД (test_cooking.db), чтобы не трогать основную.
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Импортируем приложение и зависимости
from app.main import app
from app.database import Base, get_db

# === Тестовая БД ===
TEST_DB_URL = "sqlite:///./test_cooking.db"

test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)


def override_get_db():
    """Подменяет основную БД на тестовую."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Подменяем зависимость get_db во всём приложении
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """Создаёт таблицы перед каждым тестом, удаляет после."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    """HTTP-клиент для запросов к API."""
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    """Регистрирует тестового пользователя и возвращает JWT-токен."""
    client.post("/api/auth/register", json={
        "email": "testuser@test.com",
        "password": "secret123",
        "name": "Test User",
    })
    r = client.post("/api/auth/login", data={
        "username": "testuser@test.com",
        "password": "secret123",
    })
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Готовые заголовки с Bearer-токеном."""
    return {"Authorization": f"Bearer {auth_token}"}