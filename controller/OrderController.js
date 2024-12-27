const Menu=require('../Model/Menu');
const Table=require('../Model/Table');
const Restaurant=require('../Model/Restaurant')
const Order=require('../Model/Order')

const createOrder = async (req, res) => {
    try {
      const { tableId, restaurantId, items } = req.body;

      const table = await Table.findById(tableId);
  
      // Validate inputs
      if (!tableId || !restaurantId || !items || items.length === 0) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Calculate total price
      let totalPrice = 0;
      for (const item of items) {
        const menuItem = await Menu.findById(item.menuItem);
        if (!menuItem) {
          return res.status(404).json({ error: `Menu item not found: ${item.menuItem}` });
        }
        totalPrice += menuItem.price * item.quantity;
      }
  
      // Create order
      const order = new Order({
        table: tableId,
        restaurant: restaurantId,
        items,
        totalPrice,
      });
  
      await order.save();
      table.status = "occupied";
      table.currentOrderId = order._id;
      await table.save();
  
      // Update the table to "occupied"
      await Table.findByIdAndUpdate(tableId, { isOccupied: true });
  
      return res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };


  const printBill = async (req, res) => {
    try {
      const { orderId } = req.params;
  
      const order = await Order.findById(orderId).populate('items.menuItem');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Format bill details
      const bill = {
        orderId: order._id,
        table: order.table,
        restaurant: order.restaurant,
        items: order.items.map(item => ({
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity,
          total: item.menuItem.price * item.quantity,
        })),
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
      };
  
      // Example: Send as JSON (you can generate a PDF here if needed)
      return res.status(200).json({ message: 'Bill generated', bill });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };


  module.exports = { createOrder, printBill };

