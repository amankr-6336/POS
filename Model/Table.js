// Import mongoose
const mongoose = require('mongoose');

// Define the table schema
const tableSchema = new mongoose.Schema({
  restroId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the restaurant
    ref: 'Restaurant',
    required: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  qrCode: {
    type: String, // Base64-encoded string of the QR code
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add an index to ensure table numbers are unique within a restaurant
tableSchema.index({ restroId: 1, tableNumber: 1 }, { unique: true });

// Create the Table model
const Table = mongoose.model('Table', tableSchema);

module.exports = Table;

  