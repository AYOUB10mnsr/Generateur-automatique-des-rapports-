from __future__ import annotations

from contextlib import asynccontextmanager

from app.api.router import router as api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.database.db import get_database_file_path, init_db
from app.utils.audio import ensure_dir
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    ensure_dir(settings.outputs_dir)
    ensure_dir(settings.temp_dir)
    init_db()
    print(f"[API] Startup complete. DB={get_database_file_path()}")
    yield
    print("[API] Shutdown complete")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors(), "message": "Validation failed"})


@app.exception_handler(Exception)
async def global_exception_handler(_: Request, exc: Exception):
    print(f"[API] Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(api_router, prefix=settings.api_prefix)
