import sqlite3
import os
from datetime import datetime

DB = os.path.join(os.path.dirname(__file__), "cooking.db")

TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "secret123"
TEST_NAME = "Тестовый Повар"

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def hash_password(p): return pwd_context.hash(p)
except Exception:
    # Если passlib не установлен — используем bcrypt напрямую
    import bcrypt
    def hash_password(p):
        return bcrypt.hashpw(p.encode()[:72], bcrypt.gensalt()).decode()


RECIPES = [
    {
        "title": "Оливье",
        "description": "Классический новогодний салат с колбасой и майонезом.",
        "image_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
        "category": "Салат",
        "cooking_time": 30,
        "servings": 4,
        "steps": [
            ("Отварить овощи", "Картофель, морковь и яйца отварить до готовности, остудить."),
            ("Нарезать кубиками", "Всё нарезать мелкими кубиками, колбасу — тоже."),
            ("Смешать", "Соединить, добавить горошек, посолить, заправить майонезом."),
        ],
        "ingredients": [
            ("Картофель", 300, "г", "овощи"),
            ("Морковь", 150, "г", "овощи"),
            ("Яйца", 4, "шт", "яйца"),
            ("Колбаса варёная", 300, "г", "мясо"),
            ("Горошек консервированный", 200, "г", "бакалея"),
            ("Майонез", 200, "г", "бакалея"),
        ],
    },
    {
        "title": "Борщ",
        "description": "Наваристый украинский суп со свёклой и капустой.",
        "image_url": "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800",
        "category": "Суп",
        "cooking_time": 90,
        "servings": 6,
        "steps": [
            ("Сварить бульон", "Мясо залить водой, варить 60 минут, снимая пену."),
            ("Обжарить овощи", "Лук, морковь и свёклу обжарить на масле 10 минут."),
            ("Добавить в бульон", "Картофель, капусту и зажарку — в бульон. Варить 20 минут."),
            ("Дать настояться", "Выключить, накрыть крышкой, дать постоять 15 минут."),
        ],
        "ingredients": [
            ("Говядина", 500, "г", "мясо"),
            ("Свёкла", 2, "шт", "овощи"),
            ("Капуста", 300, "г", "овощи"),
            ("Картофель", 4, "шт", "овощи"),
            ("Лук", 1, "шт", "овощи"),
            ("Морковь", 1, "шт", "овощи"),
            ("Томатная паста", 2, "ст.л.", "бакалея"),
        ],
    },
    {
        "title": "Сырники",
        "description": "Пышные творожные оладьи на завтрак.",
        "image_url": "https://images.unsplash.com/photo-1587535958098-1b3f2a3e5f2a?w=800",
        "category": "Завтрак",
        "cooking_time": 25,
        "servings": 3,
        "steps": [
            ("Замесить тесто", "Творог, яйцо, муку и сахар смешать до однородности."),
            ("Сформировать", "Мокрыми руками слепить шайбочки, обвалять в муке."),
            ("Обжарить", "На среднем огне по 3 минуты с каждой стороны."),
        ],
        "ingredients": [
            ("Творог", 400, "г", "молочное"),
            ("Яйца", 1, "шт", "яйца"),
            ("Мука", 4, "ст.л.", "бакалея"),
            ("Сахар", 2, "ст.л.", "бакалея"),
            ("Масло растительное", 2, "ст.л.", "бакалея"),
        ],
    },
    {
        "title": "Пицца Маргарита",
        "description": "Тонкая итальянская пицца с томатами и моцареллой.",
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        "category": "Основное",
        "cooking_time": 40,
        "servings": 2,
        "steps": [
            ("Замесить тесто", "Мука, вода, дрожжи, соль — вымесить 10 минут."),
            ("Дать подойти", "Накрыть, оставить на 30 минут в тепле."),
            ("Собрать пиццу", "Раскатать, смазать соусом, выложить сыр и базилик."),
            ("Запечь", "В разогретой до 250°C духовке 10–12 минут."),
        ],
        "ingredients": [
            ("Мука", 300, "г", "бакалея"),
            ("Вода", 180, "мл", "напитки"),
            ("Дрожжи сухие", 5, "г", "бакалея"),
            ("Томатный соус", 150, "г", "бакалея"),
            ("Моцарелла", 200, "г", "молочное"),
            ("Базилик", 10, "г", "зелень"),
        ],
    },
    {
        "title": "Тирамису",
        "description": "Нежный итальянский десерт с кофе и маскарпоне.",
        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
        "category": "Десерт",
        "cooking_time": 60,
        "servings": 6,
        "steps": [
            ("Сварить кофе", "Крепкий эспрессо остудить."),
            ("Взбить крем", "Желтки с сахаром взбить, добавить маскарпоне."),
            ("Собрать", "Печенье обмакнуть в кофе, выложить слоями с кремом."),
            ("Охладить", "В холодильник минимум на 4 часа."),
        ],
        "ingredients": [
            ("Печенье савоярди", 200, "г", "бакалея"),
            ("Маскарпоне", 500, "г", "молочное"),
            ("Яйца", 4, "шт", "яйца"),
            ("Сахар", 100, "г", "бакалея"),
            ("Кофе эспрессо", 300, "мл", "напитки"),
            ("Какао", 20, "г", "бакалея"),
        ],
    },
    {
        "title": "Лимонад",
        "description": "Освежающий домашний напиток с мятой.",
        "image_url": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
        "category": "Напиток",
        "cooking_time": 10,
        "servings": 4,
        "steps": [
            ("Выжать сок", "Из лимонов выжать сок в кувшин."),
            ("Добавить воду", "Залить холодной водой, добавить сахар по вкусу."),
            ("Украсить", "Положить лёд и веточки мяты."),
        ],
        "ingredients": [
            ("Лимоны", 3, "шт", "фрукты"),
            ("Вода", 1, "л", "напитки"),
            ("Сахар", 3, "ст.л.", "бакалея"),
            ("Мята", 10, "г", "зелень"),
        ],
    },
]


def get_or_create_ingredient(cur, name, unit, category):
    cur.execute("SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO ingredients (name, unit, category) VALUES (?, ?, ?)",
        (name, unit, category),
    )
    return cur.lastrowid


def main():
    if not os.path.exists(DB):
        print(f"Файл {DB} не найден. Запустите: alembic upgrade head")
        return

    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE email = ?", (TEST_EMAIL,))
    row = cur.fetchone()

    if row:
        user_id = row[0]
        print(f"Пользователь уже есть: {TEST_EMAIL} (id={user_id})")
    else:
        cur.execute(
            "INSERT INTO users (email, hashed_password, name) VALUES (?, ?, ?)",
            (TEST_EMAIL, hash_password(TEST_PASSWORD), TEST_NAME),
        )
        user_id = cur.lastrowid
        print(f" Создан пользователь: {TEST_EMAIL} / {TEST_PASSWORD} (id={user_id})")

    
    cur.execute("DELETE FROM recipe_ingredients")
    cur.execute("DELETE FROM steps")
    cur.execute("DELETE FROM recipes")
    print("Старые рецепты удалены")

    for r in RECIPES:
        cur.execute(
            """INSERT INTO recipes
               (title, description, image_url, category, cooking_time, servings, author_id)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (r["title"], r["description"], r.get("image_url"),
             r["category"], r["cooking_time"], r["servings"], user_id),
        )
        recipe_id = cur.lastrowid

        for i, (title, desc) in enumerate(r["steps"], start=1):
            cur.execute(
                "INSERT INTO steps (recipe_id, \"order\", title, description) VALUES (?, ?, ?, ?)",
                (recipe_id, i, title, desc),
            )

        for name, amount, unit, category in r["ingredients"]:
            ing_id = get_or_create_ingredient(cur, name, unit, category)
            cur.execute(
                "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (?, ?, ?)",
                (recipe_id, ing_id, amount),
            )

    conn.commit()
    conn.close()

    print(f"Создано рецептов: {len(RECIPES)}")
    print()
    print("=" * 50)
    print(" ДАННЫЕ ДЛЯ ВХОДА:")
    print(f"   Email:  {TEST_EMAIL}")
    print(f"   Пароль: {TEST_PASSWORD}")
    print("=" * 50)


if __name__ == "__main__":
    main()