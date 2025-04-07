# Use official Node image
FROM node:18-alpine as builder

# Set working directory inside the container
WORKDIR /app

# Copy the entire client folder into /app
COPY client/ .

# Install dependencies
RUN npm install

# Build the frontend
RUN npm run build

# Install serve to serve the static build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the built frontend
CMD ["serve", "-s", "dist", "-l", "3000"]