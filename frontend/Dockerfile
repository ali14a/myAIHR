# ===========================================
# FRONTEND DOCKERFILE - LEARNING VERSION
# ===========================================
# This Dockerfile teaches you how to containerize a React app

# STEP 1: Choose a base image
# Node.js 18 Alpine = Node.js + minimal Linux OS
FROM node:18-alpine

# STEP 2: Set working directory inside the container
WORKDIR /app

# STEP 3: Set environment variables
# These help Node.js run better in containers
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# STEP 4: Copy package files first (for better caching)
# Docker caches each step. If package.json doesn't change,
# it won't reinstall packages every time you change code
COPY package*.json ./

# STEP 5: Install dependencies
# This installs all the packages your app needs
RUN npm ci --only=production

# STEP 6: Copy your application code
# This copies all your React files into the container
COPY . .

# STEP 7: Build the React app for production
# This creates optimized files for production
RUN npm run build

# STEP 8: Install a web server to serve the built files
# We use nginx to serve the static files
RUN npm install -g serve

# STEP 9: Expose the port your app runs on
EXPOSE 3000

# STEP 10: Define how to start your app
# This serves the built React app
CMD ["serve", "-s", "dist", "-l", "3000"]
