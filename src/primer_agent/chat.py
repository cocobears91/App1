"""CLI for chatting with the YC + a16z primer knowledge base."""

from __future__ import annotations

import os
from typing import Iterable

import typer
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.schema import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

from . import config
from .config import VECTORSTORE_DIR


app = typer.Typer(help="Chat with an agent grounded in YC & a16z primers.")


@app.command()
def main(
    question: str = typer.Option(
        None,
        "--question",
        "-q",
        help="Ask a single question and exit. If omitted, starts an interactive chat session.",
    ),
    model: str = typer.Option("gpt-4o-mini", help="OpenAI chat model to use."),
    temperature: float = typer.Option(0.1, min=0.0, max=1.0, help="LLM temperature."),
    top_k: int = typer.Option(4, help="Number of documents to retrieve per query."),
    show_sources: bool = typer.Option(
        True, "--show-sources/--hide-sources", help="Display supporting citations."
    ),
) -> None:
    """Chat with the primer knowledge base."""

    config.load_environment()

    api_key = _require_env("OPENAI_API_KEY")
    if not api_key:
        raise typer.BadParameter("OPENAI_API_KEY is required for chat usage.")

    vector_store = _load_vector_store(api_key)

    retriever = vector_store.as_retriever(search_kwargs={"k": top_k})
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    llm = ChatOpenAI(model=model, temperature=temperature, openai_api_key=api_key)

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        return_source_documents=True,
    )

    if question:
        _answer(chain, question, show_sources)
        raise typer.Exit()

    typer.echo(
        "Interactive chat started. Type 'exit', 'quit', or press Ctrl+C to leave."
    )
    while True:
        try:
            query = typer.prompt("You")
        except (EOFError, KeyboardInterrupt):  # pragma: no cover - interactive guard
            typer.echo("\nGoodbye!")
            raise typer.Exit()

        if query.strip().lower() in {"exit", "quit", ":q"}:
            typer.echo("Goodbye!")
            raise typer.Exit()

        if not query.strip():
            continue

        _answer(chain, query, show_sources)


def _answer(chain: ConversationalRetrievalChain, query: str, show_sources: bool) -> None:
    result = chain({"question": query})
    answer: str = result.get("answer") or result.get("result")  # compatibility fallback
    typer.echo(typer.style("Agent:", fg=typer.colors.CYAN))
    typer.echo(answer.strip())

    if show_sources:
        docs: Iterable[Document] = result.get("source_documents", [])
        if docs:
            typer.echo(typer.style("Sources:", fg=typer.colors.BLUE))
            for idx, doc in enumerate(docs, start=1):
                meta = doc.metadata
                title = meta.get("title", "Unknown title")
                url = meta.get("url", "")
                typer.echo(f"  {idx}. {title} - {url}")


def _load_vector_store(api_key: str) -> FAISS:
    if not VECTORSTORE_DIR.exists():
        raise typer.BadParameter(
            "Vector store not found. Run `python -m primer_agent.ingest` first to build it."
        )

    embeddings = OpenAIEmbeddings(openai_api_key=api_key)
    return FAISS.load_local(
        str(VECTORSTORE_DIR),
        embeddings,
        allow_dangerous_deserialization=True,
    )


def _require_env(name: str) -> str:
    value = os.getenv(name)
    return value.strip() if value else ""


if __name__ == "__main__":  # pragma: no cover
    app()

