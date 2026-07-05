# Multi-stage build for BoardToken Web App
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (ignoring scripts/engines constraints for pure build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build and export the app statically for the web platform
RUN npx expo export --platform web

# Serve the static files using lightweight Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
