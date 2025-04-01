import mongoose from 'mongoose';

// Define User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    anonymous: { type: Boolean, default: false }
});

// Create User Model
const User = mongoose.model('User', userSchema);

export default User;