const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., Appetizer, Main Course, Dessert
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Menu', menuSchema);
  