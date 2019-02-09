# Node 8.x
FROM node:carbon

# Copy app files
WORKDIR /app
COPY . /app

# Install dependencies
RUN npm install -g yarn
RUN yarn install

# Build app
RUN yarn run build

# Run
ENTRYPOINT ["node", "dist/index.js"]

# Expose port 3000
EXPOSE 3000
