# Server Dockerfile (multi-stage)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm install --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]


