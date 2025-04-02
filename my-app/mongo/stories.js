import mongoose from 'mongoose';

// Define User Schema
const storiesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    genres: { type: [String], required: true },
    AuthorID: { type: String },
    Stars: { type: Number, default: 0 },
    Reviews: [
        {
            User: { type: String, },
            Stars: { type: Number },
            ReviewText: { type: String },
            CreatedAt: { type: Date, default: Date.now },
        }
    ],
    Anomymous: { type: Boolean, default: false },
    Author: { type: String },
    Private: { type: Boolean, default: false },
},
    { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create Stories Model
const Stories = mongoose.model('Stories', storiesSchema);

export default Stories;