#!/bin/sh
# start.sh

# Install dependencies
apk add --no-cache python3 py3-pip make g++

npm install
npx tsc
# Start the application
node ./dist/app.js
