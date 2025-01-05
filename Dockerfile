# Base image for Node.js
FROM node:20-slim AS base

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the entire app to the container
COPY . .

# Expose the port your app runs on
EXPOSE 1919

# Use a non-root user for security
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

# Default command
CMD ["node", "index.js"]

# Development Stage (Optional)
FROM base AS dev
# Install dev dependencies for development
RUN npm install
# Start the app with nodemon for live reload
CMD ["npm", "run", "dev"]
