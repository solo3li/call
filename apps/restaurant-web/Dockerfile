FROM node:20-alpine
WORKDIR /app
ENV RUNNING_IN_DOCKER=true
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 80
ENV PORT=80
CMD ["npm", "start"]