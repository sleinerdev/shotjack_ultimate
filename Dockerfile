# Build stage pour le frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copier le backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/

# Copier les fichiers buildés du frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Exposer le port
EXPOSE 8080

# Démarrer le serveur
CMD ["node", "backend/server.js"]


