"""Global configuration and path helpers for the primer agent."""

from __future__ import annotations

from pathlib import Path
from typing import Final

from dotenv import load_dotenv


# Resolve repository root (two levels up from this file).
ROOT_DIR: Final[Path] = Path(__file__).resolve().parents[2]
SRC_DIR: Final[Path] = ROOT_DIR / "src"

# Data directories
DATA_DIR: Final[Path] = ROOT_DIR / "data"
RAW_DATA_DIR: Final[Path] = DATA_DIR / "raw"
VECTORSTORE_DIR: Final[Path] = DATA_DIR / "vectorstore"

SOURCES_FILE: Final[Path] = DATA_DIR / "sources.yml"
ENV_FILE: Final[Path] = ROOT_DIR / ".env"


def load_environment() -> None:
    """Load environment variables from a local .env file if present."""

    if ENV_FILE.exists():
        load_dotenv(ENV_FILE)


__all__ = [
    "ROOT_DIR",
    "SRC_DIR",
    "DATA_DIR",
    "RAW_DATA_DIR",
    "VECTORSTORE_DIR",
    "SOURCES_FILE",
    "ENV_FILE",
    "load_environment",
]

