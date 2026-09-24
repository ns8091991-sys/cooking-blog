def test_register_success(client):
    """Регистрация нового пользователя."""
    r = client.post("/api/auth/register", json={
        "email": "new@test.com",
        "password": "secret123",
        "name": "New User",
    })
    assert r.status_code == 201
    assert r.json()["email"] == "new@test.com"
    assert r.json()["name"] == "New User"
    assert "id" in r.json()


def test_register_duplicate_email(client):
    """Нельзя зарегистрироваться дважды с одним email."""
    payload = {"email": "dup@test.com", "password": "secret123"}
    client.post("/api/auth/register", json=payload)
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 400
    assert "уже существует" in r.json()["detail"].lower()


def test_register_invalid_email(client):
    """Невалидный email → 422."""
    r = client.post("/api/auth/register", json={
        "email": "not-an-email",
        "password": "secret123",
    })
    assert r.status_code == 422


def test_login_success(client):
    """Логин с правильными данными."""
    client.post("/api/auth/register", json={
        "email": "login@test.com", "password": "secret123",
    })
    r = client.post("/api/auth/login", data={
        "username": "login@test.com", "password": "secret123",
    })
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert r.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Логин с неверным паролем → 401."""
    client.post("/api/auth/register", json={
        "email": "wrong@test.com", "password": "secret123",
    })
    r = client.post("/api/auth/login", data={
        "username": "wrong@test.com", "password": "wrongpass",
    })
    assert r.status_code == 401


def test_me_authenticated(client, auth_headers):
    """Получение профиля с токеном."""
    r = client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "testuser@test.com"


def test_me_without_token(client):
    """Без токена → 401."""
    r = client.get("/api/auth/me")
    assert r.status_code == 401