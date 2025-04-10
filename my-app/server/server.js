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
const PORT = process.env.PORT || 8080;
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
mongoose.connect(process.env.MONGO)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// POST route
app.post('/logged-in', authenticateToken, async (req, res) => {
    const user = req.cookies.user;

    const stories = await Stories.find({ AuthorID: req.user.id }).sort({ createdAt: -1 });

    // Decode the JWT token to get user information
    const decodedToken = jwt.verify(user, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Cookie received', decodedToken, stories });
});

app.post('/home', async (req, res) => {
    const newestStory = await Stories.findOne({ Private: { $ne: true } }).sort({ CreatedAt: -1 });

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


app.post('/get-start', async (req, res) => {
    // Handle the request to get the start page
    const stories = await Stories.find({ Private: { $ne: true } }).sort({ Stars: -1 });
    //console.log(stories);
    res.status(200).json({ message: 'Start page data', stories });
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

app.post('/write', async (req, res) => {
    //console.log("Write request received:", req.body); // Log the request body for debugging
    try {
        let newStory;
        const { title, story, genres } = req.body;
        //console.log(req.cookies.user); // Log the user object for debugging
        if (!req.cookies.user) {
            //console.log("User ID not found in token. Setting to anonymous."); // Log the user ID for debugging
            newStory = new Stories({
                title,
                content: story,
                genres,
                Author: "Guest" // Set author to "Guest"
            });
            //console.log("New story object:", newStory); // Log the new story object for debugging
            await newStory.save(); // Save the new story to the database
            res.status(201).json({ message: 'Story submitted successfully', StoryID: newStory._id });

        } else {
            authenticateToken(req, res, async () => { }); // Call the authenticateToken middleware to verify the token
            let userId = req.user.id; // Get user ID from the token

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
            res.status(200).json({ message: 'Story submitted successfully' });
        }
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

app.post('/changeVis', authenticateToken, async (req, res) => {
    try {
        const { storyId } = req.body; // Get story ID and visibility from request body

        // Find the story by ID
        const story = await Stories.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Update the visibility of the story
        story.Private = !story.Private; // Toggle visibility (true/false)
        await story.save(); // Save the updated story to the database

        res.status(200).json({ message: 'Story visibility updated successfully' });
    } catch (error) {
        console.error('Error updating story visibility:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete', authenticateToken, async (req, res) => {
    try {
        const { storyId } = req.body; // Get story ID from request body

        // Find the story by ID
        const story = await Stories.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Delete the story from the database
        await Stories.deleteOne({ _id: storyId });

        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie("user"); // Clear the cookie to log out the user
    res.status(200).json({ message: 'Logged out successfully' });
});


app.post('/claim', async (req, res) => {
    try {
        const { id } = req.body; // Get story ID from request body

        // Find the story by ID
        const story = await Stories.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        console.log(story);
        const Token = req.cookies.user; // Get token from cookies
        console.log("Token");
        if (!story.AuthorID && story.Author === "Guest") {
            if (Token) {
                return res.status(203).json({ message: 'arent guest user' });
            } else {
                // Return the story data as JSON
                return res.status(200).json(story);
            }
        }

        const user = jwt.verify(Token, process.env.JWT_SECRET); // Verify token
        if (story.AuthorID !== user.id) {
            return res.status(403).json({ message: 'You are not authorized to claim this story' });
        }

        // Return the story data as JSON
        res.status(200).json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/update/:id', async (req, res) => {
    const { id } = req.params; // Get the story ID from the URL parameters
    const { title, story, genres } = req.body; // Get the updated story data from the request body

    try {
        // Find the story by ID
        const existingStory = await Stories.findById(id);
        if (!existingStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Update the story fields
        existingStory.title = title;
        existingStory.content = story;
        existingStory.genres = genres;

        // Save the updated story to the database
        await existingStory.save();

        res.status(200).json({ message: 'Story updated successfully', story: existingStory });
    } catch (error) {
        console.error('Error updating story:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

app.post('/auth', authenticateToken, async (req, res) => {
    const user = req.user; // Get user information from the token

    if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const UserStories = await Stories.find({ AuthorID: user.id }).sort({ createdAt: -1 });
    let averageStars = 0;
    for (let i = 0; i < UserStories.length; i++) {
        //console.log(UserStories[i].Stars);
        averageStars += UserStories[i].Stars;
    }

    averageStars = averageStars / UserStories.length;
    //console.log(averageStars);

    // Return the user information as JSON
    res.status(200).json({ user, averageStars });
});

app.post('/get_users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users from the database
        console.log(users); // Log the users for debugging
        res.status(200).json(users); // Return the users as JSON
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

app.post('/delete_user/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id; // Get user ID from URL parameters
    console.log("User ID:", userId); // Log the user ID for debugging

    if (userId === req.user.id) {
        return res.status(202).json({ message: 'You cannot delete yourself' });
    }

    try {
        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all stories associated with the user
        await Stories.deleteMany({ AuthorID: userId });

        res.status(200).json({ message: 'User and associated stories deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/access', authenticateToken, async (req, res) => {
    console.log("Access request received:");
    const { password } = req.body; // Get password from request body
    console.log("Password received:", password); // Log the received password for debugging

    try {
        // Find the admin password in the database
        const pass = await Pass.findOne({});
        console.log("Admin password found:", pass); // Log the found password for debugging
        if (!pass) {
            return res.status(404).json({ message: 'Admin password not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcryptjs.compare(password, pass.password);
        console.log("Password match result:", isMatch); // Log the password match result for debugging
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Password is correct, grant access
        res.status(200).json({ message: 'Access granted' });
    } catch (error) {
        console.error('Error checking password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});