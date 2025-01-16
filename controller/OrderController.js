const Menu = require("../Model/Menu");
const Table = require("../Model/Table");
const Restaurant = require("../Model/Restaurant");
const Order = require("../Model/Order");
const KOT = require("../Model/KotSchema");
const { success, error } = require("../Utils/Utils");
const io=require("../Index.js")

const createOrder = async (req, res) => {
  try {
    const { tableId, restaurantId, items, name, number } = req.body;

    // Validate inputs
    if (!tableId || !restaurantId || !items || items.length === 0) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Fetch menu items and populate category details
    const menuItems = await Menu.find({
      _id: { $in: items.map((item) => item.menuItem) },
    }).populate("categoryId");

    // Group items by category
    const itemsByCategory = items.reduce((grouped, item) => {
      const menuItem = menuItems.find((m) => m._id.equals(item.menuItem));
      if (!menuItem) throw new Error(`Menu item ${item.menuItem} not found`);
      const category = menuItem.categoryId.name;

      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
      return grouped;
    }, {});

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const menuItem = menuItems.find((m) => m._id.equals(item.menuItem));
      if (!menuItem) {
        return res
          .status(404)
          .json({ error: `Menu item not found: ${item.menuItem}` });
      }
      totalPrice += menuItem.price * item.quantity;
    }

    // Create order
    const order = new Order({
      table: tableId,
      restaurant: restaurantId,
      items: items.map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
      })),
      totalPrice,
      user: name,
      userNumber: number,
    });

    await order.save();
    table.status = "occupied";
    table.currentOrderId = order._id;
    await table.save();

    // Update the table to "occupied"
    await Table.findByIdAndUpdate(tableId, { isOccupied: true });

    const kots = [];
    const kotIds = [];
    for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
      const kot = await KOT.create({
        order: order._id,
        items: categoryItems,
        table: order.table,
        category: category,
      });
      kots.push({ category, kot });
      kotIds.push(kot._id); // Add KOT ID to the list
    }

    // Add KOT IDs to the order
    order.kotIds = kotIds;
    await order.save();

    // Populate menuItem in order items
    const populatedOrder = await Order.findById(order._id).populate({
      path: "items.menuItem",
      select: "name price categoryId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    kots.forEach(({ category, kot }) => {
      printKOT(category, kot); // Example function to print or display KOT
    });

    // if (restaurantId) {
    //   console.log(io);
    //   io.to(restaurantId).emit("newOrder", newOrder); // Emit to the restaurant's room
    //   console.log(`Order broadcasted to room from customer: ${restaurantId}`);
    // } else {
    //   console.log("Error: No restaurantId provided in the order");
    // }

    return res
      .status(201)
      .json({
        message: "Order created successfully",
        order: populatedOrder,
        kots,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};




const printKOT = (category, kot) => {
  // console.log(`Printing KOT for ${category} Category:`, kot);
  // Add your printer logic here
};

const printBill = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("items.menuItem");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Format bill details
    const bill = {
      orderId: order._id,
      table: order.table,
      restaurant: order.restaurant,
      items: order.items.map((item) => ({
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        total: item.menuItem.price * item.quantity,
      })),
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
    };

    // Example: Send as JSON (you can generate a PDF here if needed)
    return res.status(200).json({ message: "Bill generated", bill });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const getAllOrders = async (req, res) => {
  const { restaurantId } = req.query;
  try {
    const orders = await Order.find({ restaurant: restaurantId })
      .populate({
        path: "items.menuItem",
        select: "name price categoryId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      })
      .populate("table", "tableNumber status")
      .populate("restaurant", "name address")
      .populate({
        path: "kotIds", // Populate KOTs using kotIds
        populate: {
          path: "items.menuItem", // Populate menuItem inside each KOT
          select: "name price categoryId",
          populate: {
            path: "categoryId", // Populate categoryId inside menuItem
            select: "name",
          },
        },
      })
      .sort({ createdAt: -1 });

    return res.send(success(201, orders));
  } catch (error) {
    return res.send(500, error);
  }
};

const OrderStatusChange=async (req,res)=>{
  const {orderId,status}=req.body
  try {
    const order = await Order.findByIdAndUpdate(
      orderId, 
      { status }, // Update the status field
      { new: true } // Return the updated document
    );
    return res.send(success(201,order));
  } catch (error) {
    return res.send(501,error);
  }
}

module.exports = { createOrder, printBill, getAllOrders ,OrderStatusChange };
