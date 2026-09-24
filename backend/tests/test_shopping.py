def test_preview_combines_same_ingredients(client, auth_headers):
    """Главная фишка: 200 г + 300 г лука = 500 г."""
    r1 = client.post("/api/recipes/", json={
        "title": "Блюдо 1",
    }, headers=auth_headers).json()
    r2 = client.post("/api/recipes/", json={
        "title": "Блюдо 2",
    }, headers=auth_headers).json()

    onion = client.post("/api/ingredients/", json={
        "name": "Лук", "unit": "г", "category": "овощи",
    }, headers=auth_headers).json()

    client.post(f"/api/ingredients/{r1['id']}/ingredients", json={
        "ingredient_id": onion["id"], "amount": 200,
    }, headers=auth_headers)
    client.post(f"/api/ingredients/{r2['id']}/ingredients", json={
        "ingredient_id": onion["id"], "amount": 300,
    }, headers=auth_headers)

    r = client.post("/api/shopping-list/preview", json={
        "recipe_ids": [r1["id"], r2["id"]],
    }, headers=auth_headers)

    assert r.status_code == 200
    groups = r.json()["groups"]
    onion_item = next(
        item for g in groups for item in g["items"]
        if item["name"] == "Лук"
    )
    assert onion_item["amount"] == 500


def test_preview_groups_by_category(client, auth_headers):
    """Ингредиенты группируются по категориям."""
    recipe = client.post("/api/recipes/", json={
        "title": "Тест",
    }, headers=auth_headers).json()

    carrot = client.post("/api/ingredients/", json={
        "name": "Морковь", "unit": "г", "category": "овощи",
    }, headers=auth_headers).json()
    beef = client.post("/api/ingredients/", json={
        "name": "Говядина", "unit": "г", "category": "мясо",
    }, headers=auth_headers).json()

    client.post(f"/api/ingredients/{recipe['id']}/ingredients", json={
        "ingredient_id": carrot["id"], "amount": 100,
    }, headers=auth_headers)
    client.post(f"/api/ingredients/{recipe['id']}/ingredients", json={
        "ingredient_id": beef["id"], "amount": 500,
    }, headers=auth_headers)

    r = client.post("/api/shopping-list/preview", json={
        "recipe_ids": [recipe["id"]],
    }, headers=auth_headers)

    categories = [g["category"] for g in r.json()["groups"]]
    assert "овощи" in categories
    assert "мясо" in categories


def test_preview_empty_recipes(client, auth_headers):
    """Пустой список рецептов → 400."""
    r = client.post("/api/shopping-list/preview", json={
        "recipe_ids": [],
    }, headers=auth_headers)
    assert r.status_code == 400