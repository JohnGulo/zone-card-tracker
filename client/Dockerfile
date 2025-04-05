# Use official Node image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other project files
COPY . .

# Build the frontend
RUN npm run build

# Install serve globally to serve the app
RUN npm install -g serve

# Start the app using serve
CMD ["serve", "-s", "build", "-l", "3000"]