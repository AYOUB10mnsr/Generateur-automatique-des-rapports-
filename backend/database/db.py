from __future__ import annotations

from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


# Keep SQLite location deterministic regardless of runtime working directory.
# File location: <backend>/app.db
_DEFAULT_DB_PATH = (Path(__file__).resolve().parents[1] / "app.db").resolve()
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
    # Ensure model modules are imported so their tables are registered on Base.
    from . import models  # noqa: F401

    print(f"[DB] Initializing database at: {_DEFAULT_DB_PATH}")
    Base.metadata.create_all(bind=engine)
    _apply_sqlite_safe_migrations()
    print("[DB] Table creation check complete.")


def get_database_file_path() -> str:
    """
    Return the absolute SQLite file path used by SQLAlchemy.
    """
    return str(_DEFAULT_DB_PATH)


def _apply_sqlite_safe_migrations() -> None:
    """
    Lightweight migration helper for existing SQLite files.
    Adds reports.report_language if missing.
    """
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(reports)"))
        columns = {str(row[1]) for row in result.fetchall()}
        if "report_language" not in columns:
            conn.execute(
                text("ALTER TABLE reports ADD COLUMN report_language VARCHAR NOT NULL DEFAULT 'en'")
            )
            conn.commit()
            print("[DB] Migration applied: added reports.report_language")
        if "status" not in columns:
            conn.execute(
                text("ALTER TABLE reports ADD COLUMN status VARCHAR NOT NULL DEFAULT 'completed'")
            )
            conn.commit()
            print("[DB] Migration applied: added reports.status")
        if "step" not in columns:
            conn.execute(
                text("ALTER TABLE reports ADD COLUMN step VARCHAR NOT NULL DEFAULT 'finished'")
            )
            conn.commit()
            print("[DB] Migration applied: added reports.step")
        if "error_message" not in columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN error_message TEXT"))
            conn.commit()
            print("[DB] Migration applied: added reports.error_message")
        if "pdf_path" not in columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN pdf_path VARCHAR"))
            conn.commit()
            print("[DB] Migration applied: added reports.pdf_path")
        if "provider_used" not in columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN provider_used VARCHAR"))
            conn.commit()
            print("[DB] Migration applied: added reports.provider_used")
        if "llm_generation_ms" not in columns:
            conn.execute(text("ALTER TABLE reports ADD COLUMN llm_generation_ms FLOAT"))
            conn.commit()
            print("[DB] Migration applied: added reports.llm_generation_ms")
