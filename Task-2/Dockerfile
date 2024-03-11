# Use an official base image with a compatible version of glibc
FROM ubuntu:latest

# Install dependencies required for Foundry
RUN apt-get update && \
    apt-get install -y curl git build-essential

# Install Foundry using the provided installation script
RUN curl -L https://foundry.paradigm.xyz | bash

# Add Foundry binaries to PATH
ENV PATH="/root/.foundry/bin:${PATH}"

# Set up a working directory
WORKDIR /project
RUN foundryup
# This command keeps the container running. Replace it with your own command as needed.
CMD tail -f /dev/null
