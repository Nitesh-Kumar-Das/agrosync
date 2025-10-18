FROM node:20-alpine AS base
RUN apk update && apk upgrade --no-cache

# Install dependencies
FROM base AS deps
WORKDIR /app

# Install dependencies using Alpine package manager
RUN apk add --no-cache curl ca-certificates

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Build the application
FROM base AS builder
WORKDIR /app

# Apply security updates
RUN apk upgrade --no-cache

# Copy node modules and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure TailwindCSS and PostCSS are installed
RUN npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18

# Create tailwind config if it doesn't exist
RUN npx tailwindcss init -p

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production image - using a minimal distroless image for security
FROM gcr.io/distroless/nodejs20-debian11 AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy necessary files for production
COPY --from=builder /app/public ./public

# Use standalone output mode if configured in next.config.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port
EXPOSE 3000

# Health check (using node directly since there's no shell in distroless)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"]

# Start the application (distroless has node as the entrypoint by default)
CMD ["server.js"]
