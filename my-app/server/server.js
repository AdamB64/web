import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 8080;

app.use(cors({
    origin: 'http://localhost:5173', // allow your frontend
    methods: ['GET', 'POST'],
    credentials: true // optional, only needed if you're using cookies/auth
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cookieParser()); // Middleware to parse cookies

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// POST route
app.post('/logged-in', (req, res) => {
    const user = req.cookies.user;
    if (!user) {
        return res.status(201).json({ message: 'no cookie' });
    }
    console.log('Received status:', req.body.status);
    console.log('Received cookie user:', user);

    res.status(200).json({ message: 'Cookie received', user });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});