#!/bin/bash

# Update package index
sudo apt update

# Install curl
sudo apt install -y curl gnupg 

# Install Node.js (LTS version) using NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs npm


# Install Git
sudo apt install -y git

# Clone project
git clone https://github.com/RobertGordonUniversity/cm4025-coursework-AdamB64.git

# Go into project backend folder
cd cm4025-coursework-AdamB64/my-app

secret=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")


# Create .env file with env variables
cat <<EOF > .env
NODE_ENV="development"
JWT_SECRET="$secret"
EOF


# Install dependencies
npm ci

# Open the frontend URL in the default web browser

URL="http://localhost:5173/"

xdg-open "$URL"

# Run frontend and backend together
npm run dev:all
