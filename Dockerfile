# Stage 1: Build the image based on node:lts
FROM node:lts

# Set the working directory for all subsequent commands
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
# and install dependencies first.
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# The application runs on port 3000 by default (as per the server.js file)
EXPOSE 3000

# Command to run the application when the container starts
CMD [ "npm", "start" ]
