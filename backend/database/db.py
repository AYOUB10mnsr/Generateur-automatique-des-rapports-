from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Default SQLite database file in the project root.
_DEFAULT_DB_PATH = Path("app.db").resolve()
SQLALCHEMY_DATABASE_URL = f"sqlite:///{_DEFAULT_DB_PATH.as_posix()}"

# check_same_thread=False is required for SQLite when used across threads.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def init_db() -> None:
    """
    Create all tables registered on Base metadata.
    """
    Base.metadata.create_all(bind=engine)
