import sqlite3

conn = sqlite3.connect('cooking.db')
cur = conn.cursor()

print("=== ТАБЛИЦЫ ===")
for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'"):
    print(f"  {row[0]}")

print()
print("=== РЕЦЕПТЫ ===")
for row in cur.execute("SELECT id, title FROM recipes"):
    print(f"  {row[0]}: {row[1]}")

conn.close()