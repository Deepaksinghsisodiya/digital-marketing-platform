FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ packages/
COPY apps/website/package.json apps/website/
RUN pnpm install --frozen-lockfile --filter @nexora/website...

COPY apps/website/ apps/website/

ARG NEXT_PUBLIC_API_URL=http://localhost:5201
ARG INTERNAL_API_URL=http://nexora-api:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @nexora/website build

FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=base /app ./
EXPOSE 3000
CMD ["pnpm", "--filter", "@nexora/website", "start"]
