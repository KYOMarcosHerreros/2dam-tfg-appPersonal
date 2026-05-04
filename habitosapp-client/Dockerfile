# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose logging
RUN npm ci --verbose

# Copy source code
COPY . .

# Build with verbose logging
RUN npm run build --verbose

# Production stage
FROM node:22-alpine
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built app
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the app with serve
CMD ["serve", "-s", "dist", "-l", "3000"]