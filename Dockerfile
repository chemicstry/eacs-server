ARG target=node:10-alpine

# Node 8.x
FROM node:10-alpine as build

# Copy app files
WORKDIR /app
COPY . /app

# Install dependencies
RUN npm install -g yarn
RUN yarn install

# Build app
RUN yarn run build

FROM $target
COPY --from=build /app /app

# Run
ENTRYPOINT ["node", "app/dist/index.js"]

# Expose port 3000
EXPOSE 3000
