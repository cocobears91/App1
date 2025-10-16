from fastapi import FastAPI

from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(title=settings.app_name, version="0.1.0", docs_url="/docs")
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    """Default route that confirms the service is running."""
    return {"message": "Backend service is running"}
