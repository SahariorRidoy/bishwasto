# Use Node 20 base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
