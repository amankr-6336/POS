const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // e.g., Appetizer, Main Course, Dessert
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'},
    isVeg: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    isStock:{type:Boolean,required:true}
  });
  
  module.exports = mongoose.model('Menu', menuSchema);
  