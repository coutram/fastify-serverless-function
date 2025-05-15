const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    walletId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['brand', 'creator'], required: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
