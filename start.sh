#!/bin/bash

# Update package index
sudo apt update

# Install curl
sudo apt install -y curl gnupg 

# Install Node.js (LTS version) using NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs


# Install Git
sudo apt install -y git

# Clone project
git clone https://github.com/RobertGordonUniversity/cm4025-coursework-AdamB64.git

# Go into project backend folder
cd cm4025-coursework-AdamB64/my-app/server

# Create .env file with env variables
cat <<EOF > .env
NODE_ENV="development"
JWT_SECRET="7d0bb34e3b7d4becf8876e377b0b51af0e99faf2188ddf692328140895bd5c9d9905b892c0520c7d5c22745e8d733ac2070dbc74a6d7e976ffd76a8849713df8"
EOF

# Go back to app root
cd ..

# Install dependencies
npm ci

# Run frontend and backend together
npm run dev:all
