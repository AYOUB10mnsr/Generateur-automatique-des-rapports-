from __future__ import annotations

from collections.abc import Generator

from database.db import SessionLocal, get_database_file_path, init_db
from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["get_db", "init_db", "get_database_file_path"]
