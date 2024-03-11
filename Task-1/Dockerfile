# Use an official Node.js runtime as a base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript. Assumes you have a script named "build" for this.
# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port your application will run on
EXPOSE 3000

# Copy the startup script into the container
COPY start.sh ./

# Make sure the script is executable
RUN chmod +x ./start.sh

# Define the command to start your application using the script
CMD [ "./start.sh" ]
