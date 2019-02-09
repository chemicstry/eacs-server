# Node 8.x
FROM node:carbon

# Copy app files
WORKDIR /app
COPY . /app

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Run
ENTRYPOINT ["node", "dist/index.js"]

# Expose port 3000
EXPOSE 3000
