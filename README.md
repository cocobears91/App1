# Innovation Workflow Console

A Next.js frontend for managing qualitative research uploads, automated clustering, and idea review with guardrails for non-technical stakeholders.

## Key capabilities

- **Guided upload flow** – drag-and-drop zip uploads with metadata capture and onboarding tips.
- **Real-time processing status** – background refresh powered by React Query, Notion sync visibility, and retry controls.
- **Cluster moderation workspace** – optimistic approvals/archiving with immediate feedback for reviewers.
- **Idea deep dives** – rich detail pages sourced from the GraphQL API, including market signals and Notion links.
- **Market analysis dashboard** – executive summary that surfaces validated opportunities and confidence levels.
- **Integrated auth/theming** – demo authentication context, Zustand-backed UI preferences, and light/dark theme toggle.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript, Tailwind CSS v4)
- Global state with [Zustand](https://zustand-demo.pmnd.rs/) and server state via [TanStack Query](https://tanstack.com/query)
- Component primitives built with Tailwind and Radix Slot
- Testing with Jest and Testing Library

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://api.example.com
   ```
   Without this value the client defaults to `http://localhost:4000`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` to walk through the onboarding checklist.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with Turbopack |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production server |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run test` | Execute unit and integration tests |
| `npm run test:watch` | Run tests in watch mode |

## Testing

The suite uses Jest with the `jsdom` environment and React Testing Library. Core UI flows are covered:

- `UploadForm` validates inputs and passes metadata to the mutation layer.
- `ClusterTable` ensures moderation actions trigger optimistic updates.
- `ProcessingTaskCard` reflects progress updates and feeds the global Notion status badge.

Run the tests locally with `npm run test`.

## Project structure

```
src/
  app/           # Route segments and page-level orchestration
  components/    # Shared UI primitives and layout scaffolding
  features/      # Feature-specific components for upload/status/clusters/ideas/market
  hooks/         # Reusable hooks (e.g. authentication)
  lib/           # API client and shared domain types
  store/         # Zustand store for lightweight UI state
```

Additional deployment guidance lives in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
