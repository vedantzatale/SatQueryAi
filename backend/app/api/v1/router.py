from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import analysis, evaluation, images, models, query, satellite, sessions, storage, system

api_router = APIRouter()
api_router.include_router(sessions.router)
api_router.include_router(images.router)
api_router.include_router(query.router)
api_router.include_router(analysis.router)
api_router.include_router(satellite.router)
api_router.include_router(models.router)
api_router.include_router(evaluation.router)
api_router.include_router(system.router)
api_router.include_router(storage.router)
