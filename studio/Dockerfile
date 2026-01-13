# --- Stage 1: Build the application ---
FROM oven/bun:1.3.6 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and related lock files
COPY package.json bun.lock ./

# Install dependencies (Bun will use the lockfile)
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
RUN bun run build

# --- Stage 2: Create a lean production image ---
FROM oven/bun:1.3.6-slim

# Set working directory
WORKDIR /app

# Copy only the built files from the builder stage
COPY --from=builder /app/.output/ ./

# Expose the port the application runs on
EXPOSE 3000

# Command to run the production server
ENTRYPOINT ["bun", "server/index.mjs"]