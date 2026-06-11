# Build the Angular App
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies and copy source code
COPY package*.json ./
RUN npm install
COPY . .

# Compile the project for production
RUN npx ng build --configuration production

# Serve with Nginx
FROM nginx:alpine

# Copy the compiled files from Stage 1 into the Nginx server directory
COPY --from=build /app/dist/clinical-client/browser /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]