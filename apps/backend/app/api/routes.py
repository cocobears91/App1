from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Simple liveness probe endpoint."""
    return {"status": "ok"}
