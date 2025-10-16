from celery import shared_task


@shared_task(name="worker.ping")
def ping() -> str:
    """Simple task used as a smoke test for the worker."""

    return "pong"
