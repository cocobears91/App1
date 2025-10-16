# Web app deployment guide

This document outlines the recommended workflow for building and deploying the Innovation Workflow Console.

## 1. Prerequisites

- Node.js 18 or later
- npm 10+
- Access to the target API (set `NEXT_PUBLIC_API_BASE_URL`)
- Optional: Vercel account or container registry for hosting

## 2. Environment configuration

Create an `.env.local` file for local development and `.env.production` for the deployed environment. At minimum set:

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Additional runtime configuration (OAuth client IDs, analytics keys, etc.) can be added as needed.

## 3. Build commands

Install dependencies and create a production build:

```bash
npm install
npm run build
```

Next.js outputs the generated assets to the `.next` directory. Run `npm run start` to launch the production server locally.

## 4. Running tests and linting

Ensure the pipeline executes both linting and tests prior to deployment:

```bash
npm run lint
npm run test
```

The test suite uses Jest + Testing Library and mocks browser APIs out of the box.

## 5. Deploying to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in Vercel and select the `main` branch.
3. Configure `NEXT_PUBLIC_API_BASE_URL` (Environment Variables → Production).
4. Vercel automatically runs `npm install`, `npm run build`, and `npm run start` (serverless by default for App Router).

## 6. Deploying to a custom host / container

1. Build the project using `npm run build`.
2. Create a lightweight runtime image. Example Dockerfile snippet:

   ```Dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM node:20-alpine
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   RUN npm install --omit=dev
   EXPOSE 3000
   CMD ["npm", "run", "start"]
   ```

3. Supply environment variables at runtime (e.g., via Kubernetes secrets or Docker `--env` flags).
4. Configure your reverse proxy to forward HTTPS traffic to port `3000`.

## 7. Post-deploy checks

- Verify the upload flow completes against a staging API.
- Confirm the processing status page polls and surfaces Notion sync signals.
- Smoke test the cluster actions to ensure optimistic updates match backend state.
- Capture a production build report with `NEXT_TELEMETRY_DISABLED=1` if analytics are restricted.

Following this process keeps the frontend reproducible across environments and provides observability into key workflow steps prior to shipping to end users.
