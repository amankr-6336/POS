const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  role: { type: String, enum: ['owner', 'admin'], default: 'owner' }, // Role of the user
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
