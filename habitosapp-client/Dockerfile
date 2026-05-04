# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app

# Copy built app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 4173

# Start the app
CMD ["npm", "run", "preview"]