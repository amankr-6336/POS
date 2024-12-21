const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }], // Link to menu items
    tables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }], // Link to tables
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Restaurant', restaurantSchema);
  