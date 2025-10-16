from celery import Celery

from worker.config import settings

celery_app = Celery(
    "ai_worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.task_default_queue = settings.celery_queue
celery_app.conf.result_expires = 3600
celery_app.autodiscover_tasks(["worker"])


@celery_app.task(name="worker.health_check")
def health_check() -> str:
    """Return a static heartbeat to validate worker availability."""

    return "healthy"
