FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

FROM base AS install
RUN npm ci --workspace=frontend

FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/frontend/node_modules ./frontend/node_modules
COPY frontend/tsconfig.json ./frontend/
COPY frontend/next.config.ts ./frontend/
COPY frontend/postcss.config.mjs ./frontend/
COPY frontend/next-env.d.ts ./frontend/
COPY frontend/components.json ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
RUN npm run build --workspace=frontend

FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public

EXPOSE 3000

CMD ["node", "frontend/server.js"]
