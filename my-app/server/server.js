import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import User from '../mongo/users.js';
import Stories from '../mongo/stories.js'; // Import your Stories model
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

app.post('/home', async (req, res) => {
    const newestStory = await Stories.findOne({}).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Home page data', newestStory });
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

app.post('/change_password', authenticateToken, async (req, res) => {
    try {
        const { Password, oldPassword } = req.body;
        //console.log("Password received:", Password); // Log the received password for debugging
        const userId = req.user.id; // Get user ID from the token

        // Find user by ID
        const user = await User.findById(userId);
        //console.log("User found:", user); // Log the user object for debugging
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare old password with hashed password
        const isMatch = await bcryptjs.compare(oldPassword, user.password);
        if (!isMatch) {
            //console.error("Password mismatch:", Password, user.password);
            return res.status(401).json({ message: 'Invalid old password' });
        }

        // Hash new password and update it in the database
        const hashedNewPassword = await bcryptjs.hash(Password, salt);
        //console.log("New password hashed:", hashedNewPassword); // Log the hashed new password for debugging
        user.password = hashedNewPassword;
        //console.log("User before save:", user); // Log the user object before saving
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/change_auth', authenticateToken, async (req, res) => {
    try {
        const { newRole } = req.body;
        const userId = req.user.id; // Get user ID from the token


        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's role
        req.user.author_or_reader = newRole; // Update the role in the token
        const updatesToken = jwt.sign(
            { id: user._id, email: user.email, username: user.username, anonymous: user.anonymous, author_or_reader: newRole },
            process.env.JWT_SECRET, // Use your secret key here
            { expiresIn: '7h' } // Token expiration time
        )
        res.clearCookie("user"); // Clear any existing cookie before setting a new one
        res.cookie("user", updatesToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 7000 // 7 hour expiration
        });


        user.author_or_reader = newRole;
        await user.save();

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/changeAn', authenticateToken, async (req, res) => {
    try {
        //console.log("Change anonymity request received:", req.body); // Log the request body for debugging
        const { anonymous } = req.body;
        const userId = req.user.id; // Get user ID from the token

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's anonymity status
        req.user.anonymous = anonymous; // Convert checkbox value to boolean
        const updatesToken = jwt.sign(
            { id: user._id, email: user.email, username: user.username, anonymous: anonymous, author_or_reader: user.author_or_reader },
            process.env.JWT_SECRET, // Use your secret key here
            { expiresIn: '7h' } // Token expiration time
        )
        res.clearCookie("user"); // Clear any existing cookie before setting a new one

        res.cookie("user", updatesToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 7000 // 7 hour expiration
        });
        //console.log("User before save:", req.user); // Log the user object before saving
        user.anonymous = anonymous; // Convert checkbox value to boolean
        await user.save();

        res.status(200).json({ message: 'User anonymity status updated successfully' });
    } catch (error) {
        console.error('Error updating user anonymity status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/write', authenticateToken, async (req, res) => {
    //console.log("Write request received:", req.body); // Log the request body for debugging
    try {
        let newStory;
        const { title, story, genres } = req.body;
        let userId = req.user.id; // Get user ID from the token
        if (!userId) {
            newStory = new Stories({
                title,
                content: story,
                genres,
                Anomymous: true, // Set anonymity to true
            });
            //console.log("New story object:", newStory); // Log the new story object for debugging
            await newStory.save(); // Save the new story to the database
        } else {

            // Find user by ID
            const auth = await User.findById(userId);
            if (!auth) {
                res.status(404).json({ message: 'User not found' });
            }

            if (auth.anonymous === true) {
                //userId = "anonymous"
                newStory = new Stories({
                    title,
                    content: story,
                    genres,
                    AuthorID: userId, // Use the user ID from the token
                    Anomymous: true, // Set anonymity to true
                });
            } else {
                newStory = new Stories({
                    title,
                    content: story,
                    genres,
                    AuthorID: userId, // Use the user ID from the token
                    Anomymous: false, // Set anonymity to false
                    Author: auth.username // Use the username from the token
                });
            }
            //console.log("New story object:", newStory); // Log the new story object for debugging
            await newStory.save(); // Save the new story to the database
            // Save the story to the database (you would need to implement this part)
            // For example, you can create a new Story model and save it here
        }

        res.status(200).json({ message: 'Story submitted successfully' });
    } catch (error) {
        console.error('Error submitting story:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

app.get('/story/:id', async (req, res) => {
    const { id } = req.params; // Get the story ID from the URL parameters

    try {
        // Find the story by ID
        const story = await Stories.findById(id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Return the story data as JSON
        res.status(200).json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/story/:id/review', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { Stars, ReviewText } = req.body;
    //console.log(req.user.id); // Log the user object for debugging
    if (!req.user) {
        return res.status(401).json({ message: 'user must be logged in' });
    }
    const User = req.user ? req.user.username : "anonymous"; // Use the username from the token

    if (Stars < 0 || Stars > 5) {
        return res.status(400).json({ message: "Stars must be between 0 and 5" });
    }

    try {
        const story = await Stories.findById(id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        story.Reviews.push({
            User,
            Stars,
            ReviewText,
        });

        // Optional: update average Stars rating
        const allStars = story.Reviews.map(r => r.Stars);
        const avgStars = allStars.reduce((a, b) => a + b, 0) / allStars.length;
        story.Stars = Math.round(avgStars * 10) / 10;

        await story.save();

        res.status(200).json({ message: "Review added", story });
    } catch (err) {
        res.status(500).json({ message: "Error adding review", error: err.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});