"""CLI entry point to train the senior-care billing validator risk model."""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path

import click

from validator_agent import Settings, TrainingPipeline


logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")


@click.command()
@click.option("--samples", type=int, default=None, help="Override training sample size.")
@click.option("--seed", type=int, default=None, help="Override random seed.")
@click.option("--config", type=click.Path(path_type=Path), default=None, help="Optional JSON config override.")
def main(samples: int | None, seed: int | None, config: Path | None) -> None:
    cfg = Settings()
    if config is None:
        config_env = os.getenv("CONFIG_PATH")
        if config_env:
            config = Path(config_env)
    if samples:
        cfg.training_sample_size = samples
    if seed:
        cfg.training_seed = seed
    if config:
        overrides = json.loads(config.read_text())
        cfg = Settings(**{**cfg.model_dump(), **overrides})

    pipeline = TrainingPipeline(cfg)
    artifacts = pipeline.run()

    logging.info("Model stored at %s", artifacts.model_path)
    logging.info("Metrics stored at %s", artifacts.metrics_path)
    logging.info("ROC-AUC: %.3f", artifacts.metrics["roc_auc"])


if __name__ == "__main__":
    main()

