# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy frontend package.json and lock file
COPY client/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend files
COPY client ./

# Build the frontend
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose the port Render expects
EXPOSE 3000

# Start the frontend server
CMD ["serve", "-s", "build", "-l", "3000"]