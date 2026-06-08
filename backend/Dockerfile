FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/

FROM base AS install
RUN npm ci --workspace=backend

FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/backend/node_modules ./backend/node_modules
COPY backend/tsconfig.json ./backend/
COPY backend/nest-cli.json ./backend/
COPY backend/src ./backend/src
RUN npm run build --workspace=backend
RUN npx prisma generate --schema=backend/prisma/schema.prisma

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/package.json ./

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/main.js"]
