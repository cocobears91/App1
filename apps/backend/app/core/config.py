from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="allow",
    )

    app_name: str = Field(default="Monorepo Backend", alias="APP_NAME")
    environment: str = Field(default="development", alias="APP_ENV")
    log_level: str = Field(default="info", alias="BACKEND_LOG_LEVEL")
    reload: bool = Field(default=True, alias="BACKEND_RELOAD")

    postgres_host: str = Field(default="postgres", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_user: str = Field(default="app_user", alias="POSTGRES_USER")
    postgres_password: str = Field(default="app_password", alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="app_db", alias="POSTGRES_DB")

    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")
    celery_broker_url: str = Field(default="redis://redis:6379/0", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://redis:6379/1", alias="CELERY_RESULT_BACKEND")

    minio_endpoint: str = Field(default="http://minio:9000", alias="MINIO_ENDPOINT")
    minio_bucket: str = Field(default="app-bucket", alias="MINIO_BUCKET")
    minio_region: str = Field(default="us-east-1", alias="MINIO_REGION")

    @property
    def database_url(self) -> str:
        """Return the SQLAlchemy async connection URL."""
        return (
            "postgresql+asyncpg://"
            f"{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    """Cached settings factory for dependency injection."""

    return Settings()


settings = get_settings()

__all__ = ["Settings", "settings", "get_settings"]
