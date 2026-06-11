# Use a lightweight Node.js environment
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package definitions and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend code (src folder, server.js)
COPY . .

# Expose the API port
EXPOSE 4000

# Start the Express server
CMD ["node", "server.js"]