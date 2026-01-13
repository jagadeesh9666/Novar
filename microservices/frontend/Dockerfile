# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Use npm install to avoid lockfile requirement; switch to npm ci if you commit package-lock.json
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.25-alpine
RUN addgroup -S web && adduser -S web -G web
COPY --chown=web:web --from=build /app/build /usr/share/nginx/html
# Optional: custom nginx.conf for SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf
USER web
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost:3000 || exit 1

