# YC ? a16z Primer Agent

This project builds a retrieval-augmented chatbot grounded in publicly available primers from Y Combinator and Andreessen Horowitz. It downloads the latest versions of the curated articles, normalises the text, embeds the content, and exposes a CLI agent you can converse with.

## Features

- Curated knowledge base of YC startup advice and a16z operational primers
- Automated ingestion pipeline with caching of raw article text
- FAISS vector store with configurable chunk sizes
- Conversational CLI backed by OpenAI Chat models with optional source citations
- Extensible source catalogue defined in `data/sources.yml`

## Project layout

- `src/primer_agent/ingest.py` ? Typer CLI to fetch sources and build the embeddings store
- `src/primer_agent/chat.py` ? Conversational CLI over the vector store
- `data/sources.yml` ? list of YC & a16z primers plus parser directives
- `data/raw/` ? cached raw text (created after ingestion)
- `data/vectorstore/` ? persisted FAISS index and metadata manifest

## Quick start

```bash
pip install -r requirements.txt
cp .env.example .env  # add your OpenAI key
export PYTHONPATH=src  # or run via `python -m primer_agent` from the src directory
python -m primer_agent.ingest
python -m primer_agent.chat
```

You need an `OPENAI_API_KEY` (or `export OPENAI_API_KEY=...`) to build embeddings and run the agent.

### Customising ingestion

- Re-run ingestion with `--refresh` to re-download sources
- Ingest a subset: `python -m primer_agent.ingest --source-id yc_before_growing a16z_acquihires`
- Adjust chunking: `python -m primer_agent.ingest --chunk-size 900 --chunk-overlap 120`

### Using the chat agent

- Ask one-off question: `python -m primer_agent.chat -q "How do YC founders tackle retention?"`
- Interactive mode (default) supports commands `exit`, `quit`, or `:q`
- Hide citations: `python -m primer_agent.chat --hide-sources`
- Change model: `python -m primer_agent.chat --model gpt-4o`

## Extending the knowledge base

Add items to `data/sources.yml` with fields:

```yaml
- id: unique_identifier
  organization: yc | a16z | custom
  title: Human readable title
  url: https://example.com/article
  parser: yc_library | a16z_wp
  tags: [optional, tags]
```

After updating the file, rerun `python -m primer_agent.ingest` to rebuild the store.

If you target a site with a different structure, add a custom parser in `primer_agent.ingest` and reference it from the YAML entry.

## Troubleshooting

- **Missing vector store** ? run the ingestion step first.
- **OpenAI errors** ? confirm `OPENAI_API_KEY` is present and the chosen model is available in your account.
- **Parser failures** ? sources occasionally change HTML structure. Re-run with `--refresh` and, if needed, tweak the parser logic to match the new DOM.

## Next steps

- Swap in alternate embedding providers (e.g. local models) by extending `_build_embeddings`
- Add unit tests around parsers and YAML validation
- Deploy as an API or Slack bot using the same vector store

