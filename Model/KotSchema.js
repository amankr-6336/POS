const mongoose = require('mongoose');

const kotSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  category: { type: String, required: true },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KOT', kotSchema);
