# TanStack Start + Nitro builds to `.output`, not `dist`.
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim

WORKDIR /app

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
