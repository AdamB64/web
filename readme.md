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

### 1. Run Setup Script

```bash
bash <(curl -s https://raw.githubusercontent.com/RobertGordonUniversity/cm4025-coursework-AdamB64/main/setup.sh)
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