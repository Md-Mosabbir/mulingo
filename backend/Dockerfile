# ================================
# 1. Base Stage
# ================================
FROM node:20-alpine AS base

WORKDIR /app

# Copy root and backend package files
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/

# ================================
# 2. Development Stage
# ================================
FROM base AS development

# Install all dependencies (including dev)
RUN npm install

# Copy source
COPY backend/ ./backend/

WORKDIR /app/backend

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# Nodemon script from package.json
CMD ["npm", "run", "dev"]

# ================================
# 3. Builder Stage (for Prod)
# ================================
FROM base AS builder

RUN npm install
COPY backend/ ./backend/

WORKDIR /app/backend
RUN npm run build

# ================================
# 4. Production Runner Stage
# ================================
FROM base AS production

WORKDIR /app

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy compiled backend from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/

WORKDIR /app/backend

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
