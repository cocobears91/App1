from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Shared configuration for the Celery worker."""

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="allow",
    )

    app_name: str = Field(default="AI Worker", alias="APP_NAME")
    environment: str = Field(default="development", alias="APP_ENV")

    celery_broker_url: str = Field(default="redis://redis:6379/0", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://redis:6379/1", alias="CELERY_RESULT_BACKEND")
    celery_queue: str = Field(default="default", alias="CELERY_QUEUE")

    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

__all__ = ["settings", "get_settings", "Settings"]
