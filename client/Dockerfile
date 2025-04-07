# Use official Node image
FROM node:18

# Set working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json from client folder
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files from client folder into the container
COPY client/ .

# Build the React frontend
RUN npm run build

# Install serve to serve the static build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]