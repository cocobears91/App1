"""Utilities for loading and validating primer source definitions."""

from __future__ import annotations

import dataclasses
from pathlib import Path
from typing import Iterable, List

import yaml

from .config import SOURCES_FILE

SUPPORTED_PARSERS = {"yc_library", "a16z_wp"}


@dataclasses.dataclass(frozen=True)
class SourceSpec:
    """Structured representation of a single primer source."""

    id: str
    organization: str
    title: str
    url: str
    parser: str
    tags: tuple[str, ...] = dataclasses.field(default_factory=tuple)

    @classmethod
    def from_mapping(cls, data: dict) -> "SourceSpec":
        missing = {key for key in ("id", "organization", "title", "url", "parser") if key not in data}
        if missing:
            missing_list = ", ".join(sorted(missing))
            raise ValueError(f"Source definition missing required keys: {missing_list}")

        parser = data["parser"].strip()
        if parser not in SUPPORTED_PARSERS:
            supported = ", ".join(sorted(SUPPORTED_PARSERS))
            raise ValueError(f"Unsupported parser '{parser}'. Supported parsers: {supported}")

        tags: Iterable[str] = data.get("tags", []) or []
        tag_tuple = tuple(str(tag) for tag in tags)

        return cls(
            id=str(data["id"]),
            organization=str(data["organization"]),
            title=str(data["title"]),
            url=str(data["url"]),
            parser=parser,
            tags=tag_tuple,
        )


def load_sources(path: Path | None = None) -> List[SourceSpec]:
    """Load and validate all source definitions from the YAML file."""

    resolved_path = path or SOURCES_FILE
    if not resolved_path.exists():
        raise FileNotFoundError(f"Source configuration not found: {resolved_path}")

    with resolved_path.open("r", encoding="utf-8") as handle:
        payload = yaml.safe_load(handle)

    if not payload or "sources" not in payload:
        raise ValueError(f"Source configuration {resolved_path} must contain a top-level 'sources' list")

    try:
        raw_sources = list(payload["sources"])
    except TypeError as exc:  # payload['sources'] not iterable
        raise ValueError("'sources' must be a list of mappings") from exc

    specs = [SourceSpec.from_mapping(source) for source in raw_sources]

    duplicate_ids = _find_duplicates(spec.id for spec in specs)
    if duplicate_ids:
        raise ValueError(f"Duplicate source ids found: {', '.join(sorted(duplicate_ids))}")

    return specs


def _find_duplicates(items: Iterable[str]) -> set[str]:
    seen: set[str] = set()
    duplicates: set[str] = set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return duplicates


__all__ = [
    "SUPPORTED_PARSERS",
    "SourceSpec",
    "load_sources",
]

