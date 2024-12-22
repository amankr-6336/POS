const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., Appetizer, Main Course, Dessert
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'},
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Menu', menuSchema);
  