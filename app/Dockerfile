# --- Build Stage ---
FROM oven/bun:1.3.7 AS build

WORKDIR /app

# Copy only dependency files first — improves caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY ./src ./src

# Build a fully static binary
RUN bun build \
    src/index.ts \
    --compile \
    --sourcemap=inline \
    --minify-whitespace \
    --minify-syntax \
    --outfile=bunvel-app && \
    chmod +x bunvel-app

# --- Runner Stage ---
FROM gcr.io/distroless/base

WORKDIR /app

# Only copy final binary
COPY --from=build /app/bunvel-app ./bunvel-app

ENV NODE_ENV=production

EXPOSE 8000

ENTRYPOINT ["./bunvel-app"]
