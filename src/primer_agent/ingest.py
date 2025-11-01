"""CLI for downloading primer content and building an embedding store."""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import asdict
from html import unescape as html_unescape
from typing import Iterable, List, Sequence

import requests
import typer
from bs4 import BeautifulSoup
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

try:  # openai RateLimitError location varies across versions
    from openai import RateLimitError
except ImportError:  # pragma: no cover
    RateLimitError = Exception

from . import config
from .config import RAW_DATA_DIR, VECTORSTORE_DIR
from .data_sources import SourceSpec, load_sources

app = typer.Typer(help="Download YC + a16z primers and build the retrieval index.")

USER_AGENT = (
    "PrimerAgent/1.0 (+https://github.com/cursor/primer-agent; "
    "contact=founders@primer-agent.local)"
)


@app.command()
def main(
    source_id: List[str] = typer.Option(  # noqa: B008 (typer specific)
        None,
        "--source-id",
        help="Ingest only the provided source ids (can provide multiple).",
    ),
    refresh: bool = typer.Option(
        False, "--refresh", help="Force re-download even if cached raw text exists."
    ),
    chunk_size: int = typer.Option(1200, help="Text chunk size for embeddings."),
    chunk_overlap: int = typer.Option(150, help="Chunk overlap for embeddings."),
) -> None:
    """Entry point invoked by Typer."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    config.load_environment()

    specs = _select_sources(load_sources(), source_id)
    if not specs:
        typer.echo("No sources matched the provided filters.")
        raise typer.Exit(code=1)

    documents: list[Document] = []

    for spec in specs:
        typer.echo(f"Processing {spec.id} ({spec.title})")
        text = _get_or_fetch_text(spec, refresh=refresh)
        docs = _create_documents(spec, text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        documents.extend(docs)

    if not documents:
        typer.echo("No documents were produced - check source configuration.")
        raise typer.Exit(code=1)

    embeddings = _build_embeddings()

    VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

    vector_store = _vector_store_with_backoff(documents, embeddings)
    vector_store.save_local(str(VECTORSTORE_DIR))

    _write_manifest(specs, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

    typer.echo(
        typer.style(
            f"Built vector store with {len(documents)} chunks across {len(specs)} sources.",
            fg=typer.colors.GREEN,
        )
    )


def _select_sources(specs: Sequence[SourceSpec], ids: Sequence[str] | None) -> list[SourceSpec]:
    if not ids:
        return list(specs)
    include = {item.strip() for item in ids if item.strip()}
    return [spec for spec in specs if spec.id in include]


def _get_or_fetch_text(spec: SourceSpec, refresh: bool) -> str:
    raw_path = RAW_DATA_DIR / f"{spec.id}.txt"
    if raw_path.exists() and not refresh:
        return raw_path.read_text(encoding="utf-8")

    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

    html = _download(spec.url)
    if spec.parser == "yc_library":
        text = _parse_yc_library(html)
    elif spec.parser == "a16z_wp":
        text = _parse_a16z_wp(html)
    else:  # pragma: no cover - safeguarded by validation
        raise ValueError(f"Unsupported parser: {spec.parser}")

    cleaned = _normalise_text(text)
    raw_path.write_text(cleaned, encoding="utf-8")
    return cleaned


def _download(url: str) -> str:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    response.raise_for_status()
    response.encoding = response.encoding or "utf-8"
    return response.text


def _parse_yc_library(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    payload_container = soup.find("div", attrs={"data-page": True})
    if not payload_container:
        raise ValueError("Could not locate YC data payload in page")

    try:
        payload = json.loads(html_unescape(payload_container["data-page"]))
        article_html = payload["props"]["article"]["content"]
    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        raise ValueError("Unexpected YC payload structure") from exc

    article_soup = BeautifulSoup(html_unescape(article_html), "lxml")
    return article_soup.get_text("\n", strip=True)


def _parse_a16z_wp(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    content = soup.select_one("div.wp-content")
    if not content:
        raise ValueError("Could not locate article body for a16z page")

    return content.get_text("\n", strip=True)


def _normalise_text(text: str) -> str:
    collapsed = "\n".join(line.rstrip() for line in text.splitlines())
    # Remove redundant blank lines while keeping paragraph spacing
    lines = []
    blank = False
    for line in collapsed.splitlines():
        if not line.strip():
            if not blank:
                lines.append("")
            blank = True
        else:
            lines.append(line)
            blank = False
    return "\n".join(lines).strip()


def _create_documents(
    spec: SourceSpec, text: str, *, chunk_size: int, chunk_overlap: int
) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " "]
    )
    chunks = splitter.split_text(text)
    metadata = {
        "source_id": spec.id,
        "title": spec.title,
        "url": spec.url,
        "organization": spec.organization,
        "tags": list(spec.tags),
    }
    return [Document(page_content=chunk, metadata=metadata) for chunk in chunks]


def _build_embeddings():
    api_key = _require_env("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY must be configured to build embeddings. "
            "Set it via environment variable or an .env file."
        )
    return OpenAIEmbeddings(
        openai_api_key=api_key,
        model="text-embedding-3-small",
        max_retries=10,
        request_timeout=60,
    )


def _vector_store_with_backoff(documents: Sequence[Document], embeddings: OpenAIEmbeddings) -> FAISS:
    iterator = iter(documents)
    first = next(iterator)
    store = FAISS.from_texts(
        [first.page_content],
        embeddings,
        metadatas=[first.metadata],
    )

    for doc in iterator:
        _add_document_with_backoff(store, doc)

    return store


def _add_document_with_backoff(store: FAISS, doc: Document) -> None:
    delay = 2.0
    attempts = 0
    while True:
        try:
            store.add_texts([doc.page_content], metadatas=[doc.metadata])
            time.sleep(0.5)
            return
        except RateLimitError as exc:  # pragma: no cover - network dependent
            attempts += 1
            if attempts >= 12:
                raise exc
            sleep_for = min(delay * (1.5 ** attempts), 30.0)
            typer.echo(f"Rate limited, retrying in {sleep_for:.1f}s...")
            time.sleep(sleep_for)


def _write_manifest(specs: Iterable[SourceSpec], *, chunk_size: int, chunk_overlap: int) -> None:
    manifest = {
        "chunk_size": chunk_size,
        "chunk_overlap": chunk_overlap,
        "sources": [asdict(spec) for spec in specs],
    }
    manifest_path = VECTORSTORE_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def _require_env(name: str) -> str:
    value = os.getenv(name)
    return value.strip() if value else ""


if __name__ == "__main__":  # pragma: no cover
    app()

