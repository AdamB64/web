import mongoose from 'mongoose';

// Define User Schema
const storiesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    story: { type: String, required: true },
    genres: { type: [String], required: true },
    AuthorID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},
    { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create User Model
const Stories = mongoose.model('User', storiesSchema);

export default Stories;