# Stage 1: Build the Expo Web app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Export static web files
RUN npx expo export -p web

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration to handle Expo Router paths
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the exported files from the builder stage
# Expo export outputs to 'dist' directory by default
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
