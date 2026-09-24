from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from alembic import context


import os
import sys

# Чтобы Alembic видел модули app.*
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.config import settings
from app.database import Base
# Импортируйте сюда ВСЕ модели, чтобы Alembic их увидел
from app.models import (  # noqa
    user, recipe, step, ingredient, recipe_ingredient, shopping_list, favorite,
)

config = context.config

# Прокидываем DATABASE_URL из настроек (.env)
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connect_args = {}
    if settings.database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    connectable = create_engine(settings.database_url, connect_args=connect_args)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()