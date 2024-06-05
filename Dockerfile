# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node","--env-file", ".env", "--watch","server.js"]
