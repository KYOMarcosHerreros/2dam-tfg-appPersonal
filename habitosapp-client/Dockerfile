# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci)
RUN npm install

# Copy source code
COPY . .

# Set environment variable for build
ENV NODE_ENV=production

# Build the app
RUN npm run build

# Production stage - Use nginx to serve static files
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Remove default nginx files
RUN rm -rf ./*

# Copy built app from build stage
COPY --from=build /app/dist .

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Expose Railway's dynamic port
EXPOSE $PORT

# Start nginx with dynamic port substitution
CMD ["sh", "-c", "envsubst '$$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]