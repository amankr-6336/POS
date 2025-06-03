const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
        quantity: { type: Number, required: true },
      },
    ],
    kotIds:[ {type: mongoose.Schema.Types.ObjectId, ref: 'KOT'}],
    user:{type:String,required:true},
    userNumber:{type:Number,required:true},
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['orderConfirmed', 'preparing', 'served' ,'paid'], default: 'orderConfirmed' },
    createdAt: { type: Date, default: Date.now },
  });

  orderSchema.index({ restaurant: 1 });
  orderSchema.index({ status: 1 });
  orderSchema.index({ user: 1 });
  orderSchema.index({ restaurant: 1, createdAt: -1 });
  
  module.exports = mongoose.model('Order', orderSchema);
  