#!/bin/bash

# Update package index
sudo apt update

# Install curl
sudo apt install -y curl

# Install Node.js (LTS version) using NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Import the MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
  gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# Create the MongoDB source list file
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package index
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Enable and start the MongoDB service
sudo systemctl enable mongod
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# Install Git
sudo apt install -y git

git clone https://github.com/RobertGordonUniversity/cm4025-coursework-AdamB64.git

cd cm4025-coursework-AdamB64/my-app

npm ci

npm run dev:all

