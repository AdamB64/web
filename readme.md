# 📚 CM4025 Coursework – MERN Stack Web App

This project is a **MERN stack** (MongoDB, Express, React, Node.js) fullstack web application created for the CM4025 coursework. It features a modern React frontend built with **Vite** and a Node.js/Express backend with JWT-based authentication.

---

## ⚙️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (configured separately)
- **Authentication**: JSON Web Tokens (JWT)
- **Package Manager**: npm
- **Dev Script**: Runs frontend & backend concurrently

---

## 🚀 Quick Start (Linux)

Use the one-step setup script to install everything and start the app.

### Requirements

- Ubuntu/Debian Linux
- Bash shell
- Internet connection

### 1. Run Setup Script (i`ve had to add my username and github token to the clone, like so https://username:Token@github/repo)
```bash
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
```

# ℹ️ This script will:

Install Node.js, npm, Git

Clone the project

Generate a JWT secret

Create a .env file

Install project dependencies

Open the frontend in your browser

Start both frontend and backend

# 🛠 Manual Setup
Prefer to do things yourself? Follow these steps:
```bash
# Install Node.js (LTS), npm, and Git if you haven't already

# Clone the repository
git clone https://github.com/RobertGordonUniversity/cm4025-coursework-AdamB64.git
cd cm4025-coursework-AdamB64/my-app

# Install backend and frontend dependencies
npm ci

# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Create a `.env` file with the following:
NODE_ENV="development"
JWT_SECRET="your_generated_secret_here"

# Start the fullstack development server
npm run dev:all
```

# 🌐 Frontend
Built using React and Vite for fast development and hot module reload.

Runs on: http://localhost:5173

# 🔧 Backend
Express.js handles API endpoints and JWT authentication.

Runs on: http://localhost:3000

MongoDB must be running and configured in the backend code (.env file if applicable).

# 📁 Scripts
Command	Description
npm run dev	Starts only the backend server
npm run dev:all	Starts both backend and frontend concurrently