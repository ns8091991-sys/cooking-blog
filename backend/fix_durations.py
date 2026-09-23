import sqlite3
import os

DB = os.path.join(os.path.dirname(__file__), "cooking.db")
DURATIONS = [300, 600, 240, 180, 120]  # 5, 10, 4, 3, 2 мин

conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute('SELECT id, "order" FROM steps ORDER BY recipe_id, "order"')
rows = cur.fetchall()

for step_id, order in rows:
    duration = DURATIONS[(order - 1) % 5]
    cur.execute("UPDATE steps SET duration = ? WHERE id = ?", (duration, step_id))

conn.commit()
conn.close()
print(f"OK: {len(rows)} шагов обновлено")