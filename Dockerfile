# Use official lightweight Node image
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and lockfile from client
COPY client/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy all frontend source files
COPY client/ .

# Build using Vite (relies on local node_modules/.bin/vite)
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Set the directory where the build output lives
WORKDIR /app

# Expose the port serve will run on
EXPOSE 3000

# Serve the static site from build/ folder
CMD ["serve", "-s", "build", "-l", "3000"]