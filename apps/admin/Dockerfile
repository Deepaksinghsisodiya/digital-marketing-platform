FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ packages/
COPY apps/admin/package.json apps/admin/
RUN pnpm install --frozen-lockfile --filter @nexora/admin...

COPY apps/admin/ apps/admin/

ARG VITE_API_URL=http://localhost:5201
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter @nexora/admin build

FROM nginx:1.27-alpine AS runtime
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
