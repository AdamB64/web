import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import User from '../mongo/users.js'; // Adjust the path as necessary
import bcryptjs from 'bcryptjs'; // Import bcryptjs for password hashing
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import dotenv from 'dotenv';

const app = express();
const PORT = 8080;
const salt = 15; // Hashing rounds for bcryptjs
dotenv.config(); // Load environment variables from .env file

app.use(cors({
    origin: 'http://localhost:5173', // allow your frontend
    methods: ['GET', 'POST', 'OPTIONS'], // allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allow these headers
    credentials: true // optional, only needed if you're using cookies/auth
}));


// Built-in middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cookieParser()); // Middleware to parse cookies


// Middleware to protect routes
function authenticateToken(req, res, next) {
    //console.log('Authenticating token...');
    const token = req.cookies.user; // Get token from cookies
    //console.log(token);

    if (!token) {
        return res.status(201).json({ message: 'No token. Please log in.' }); // Send error response if no token is found
    }

    try {
        // Verify token
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to the request object (optional)
        req.user = user;

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(403).json({ message: 'Invalid token' }); // Send error response if token is invalid
    }
}

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mydatabase')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// POST route
app.post('/logged-in', authenticateToken, (req, res) => {
    const user = req.cookies.user;

    // Decode the JWT token to get user information
    const decodedToken = jwt.verify(user, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Cookie received', decodedToken });
});

app.post('/signup', async (req, res) => {
    try {
        const { email, username, password, anonymous, a_or_r } = req.body;

        const hashedPassword = await bcryptjs.hash(password, salt); // Hash the password

        // Create new user instance
        const newUser = new User({
            email,
            username,
            password: hashedPassword, // Store the hashed password
            anonymous: anonymous === 'on', // because checkbox sends 'on' when checked
            author_or_reader: a_or_r // Store the author/reader preference
        });

        // Save to DB
        await newUser.save();

        const user = jwt.sign(
            { id: newUser._id, email: newUser.email, username: newUser.username, anonymous: newUser.anonymous, author_or_reader: newUser.author_or_reader },
            process.env.JWT_SECRET, // Use your secret key here
            { expiresIn: '7h' } // Token expiration time
        )

        res.clearCookie("user"); // Clear any existing cookie before setting a new one

        res.cookie("user", user, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === "production", // Use HTTPS in production
            sameSite: "strict", // Helps prevent CSRF attacks
            maxAge: 60 * 60 * 7000 // 7 hour expiration
        });

        //console.log('User saved:', newUser);
        res.redirect('http://localhost:5173/User'); // Redirect to User page after signup
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username }) || await User.findOne({ email: username });
        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare password with hashed password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, anonymous: user.anonymous, author_or_reader: user.author_or_reader },
            process.env.JWT_SECRET, // Use your secret key here
            { expiresIn: '7h' } // Token expiration time
        )

        res.clearCookie("user"); // Clear any existing cookie before setting a new one

        res.cookie("user", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 7000 // 7 hour expiration
        });

        res.redirect('http://localhost:5173/User'); // Redirect to User page after login
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/get-start', authenticateToken, (req, res) => {
    // Handle the request to get the start page
    res.status(200).json({ message: 'Start page data' });
}
);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});