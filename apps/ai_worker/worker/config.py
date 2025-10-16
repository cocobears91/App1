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

    postgres_host: str = Field(default="postgres", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_user: str = Field(default="app_user", alias="POSTGRES_USER")
    postgres_password: str = Field(default="app_password", alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="app_db", alias="POSTGRES_DB")

    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")
    openai_embedding_model: str = Field(default="text-embedding-3-small", alias="OPENAI_EMBEDDING_MODEL")
    openai_max_retries: int = Field(default=3, alias="OPENAI_MAX_RETRIES")
    openai_timeout: int = Field(default=60, alias="OPENAI_TIMEOUT")

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
    return Settings()


settings = get_settings()

__all__ = ["settings", "get_settings", "Settings"]
