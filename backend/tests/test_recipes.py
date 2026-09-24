def test_create_recipe_authenticated(client, auth_headers):
    """Авторизованный создаёт рецепт."""
    r = client.post("/api/recipes/", json={
        "title": "Тестовый рецепт",
        "description": "Описание",
        "category": "Основное",
        "cooking_time": 30,
        "servings": 2,
    }, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["title"] == "Тестовый рецепт"
    assert r.json()["author_id"] is not None


def test_create_recipe_unauthenticated(client):
    """Без токена → 401."""
    r = client.post("/api/recipes/", json={
        "title": "Не должно создаться",
    })
    assert r.status_code == 401


def test_list_recipes_empty(client):
    """Пустой список рецептов."""
    r = client.get("/api/recipes/")
    assert r.status_code == 200
    assert r.json() == []


def test_list_recipes_with_data(client, auth_headers):
    """Список после создания рецепта."""
    client.post("/api/recipes/", json={
        "title": "Первый", "description": "Тест",
    }, headers=auth_headers)
    r = client.get("/api/recipes/")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Первый"


def test_get_recipe_by_id(client, auth_headers):
    """Получить рецепт по id."""
    created = client.post("/api/recipes/", json={
        "title": "Конкретный",
    }, headers=auth_headers).json()
    r = client.get(f"/api/recipes/{created['id']}")
    assert r.status_code == 200
    assert r.json()["title"] == "Конкретный"


def test_get_nonexistent_recipe(client):
    """Несуществующий рецепт → 404."""
    r = client.get("/api/recipes/9999")
    assert r.status_code == 404


def test_update_own_recipe(client, auth_headers):
    """Автор обновляет свой рецепт."""
    created = client.post("/api/recipes/", json={
        "title": "Старое название",
    }, headers=auth_headers).json()
    r = client.put(f"/api/recipes/{created['id']}", json={
        "title": "Новое название",
        "description": "Обновлено",
    }, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Новое название"


def test_update_others_recipe(client, auth_headers):
    """Чужой рецепт редактировать нельзя → 403."""
    recipe = client.post("/api/recipes/", json={
        "title": "Рецепт первого",
    }, headers=auth_headers).json()

    client.post("/api/auth/register", json={
        "email": "other@test.com", "password": "secret123",
    })
    other_token = client.post("/api/auth/login", data={
        "username": "other@test.com", "password": "secret123",
    }).json()["access_token"]

    r = client.put(f"/api/recipes/{recipe['id']}", json={
        "title": "Взломано",
    }, headers={"Authorization": f"Bearer {other_token}"})
    assert r.status_code == 403


def test_delete_own_recipe(client, auth_headers):
    """Автор удаляет свой рецепт."""
    created = client.post("/api/recipes/", json={
        "title": "Удалить меня",
    }, headers=auth_headers).json()
    r = client.delete(f"/api/recipes/{created['id']}", headers=auth_headers)
    assert r.status_code == 204

    r = client.get(f"/api/recipes/{created['id']}")
    assert r.status_code == 404