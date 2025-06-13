# 1️⃣ Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Set working directory to frontend
WORKDIR /app/frontend

# Install deps first (for cache reuse)
COPY package*.json ./

RUN npm install

# Then copy rest of files and build
COPY frontend/.

RUN npm run build

# 2️⃣ Run stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Prepare directory
WORKDIR /app/frontend

# Install only production deps
COPY --from=builder /app/frontend/package*.json .

RUN npm install --production

# Copy build output from builder
COPY --from=builder /app/frontend/.next .next
COPY --from=builder /app/frontend/public public

# Expose port
EXPOSE 3000

CMD ["npm", "start"]
