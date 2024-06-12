FROM node:18-alpine3.18

WORKDIR /app

# Install dependencies for bcrypt and node-gyp
RUN apk add --no-cache python3 make g++ nodejs npm

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean npm cache and install npm dependencies inside the Docker container
RUN npm cache clean --force && npm install

# Rebuild bcrypt specifically for the container's architecture
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Debugging: Verify installation and architecture
RUN uname -m && node -v && npm -v && ls -l /app/node_modules/bcrypt/lib/binding/napi-v3/

# Expose the port
EXPOSE 8000

# Start the application
CMD ["node", "app.js"]
