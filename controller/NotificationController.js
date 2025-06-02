const Notification = require("../Model/NotificationSchema");
const { getIo } = require("../Utils/Socket");
const { success, error } = require("../Utils/Utils");
const {sendNotificationToOwner}=require('../Utils/firebaseAdmin')
const Restaurant=require("../Model/Restaurant")

const getNotification = async (req, res) => {
  const { restaurantId } = req.query;
  console.log(restaurantId, "from asdfghjklasdfghjsdfghjdfg");
  try {
    const notification = await Notification.find({
      restroId: restaurantId,
    }).sort({ createdAt: -1 });

    return res.send(success(200, notification));
  } catch (error) {
    return res.send(501, error);
  }
};
const generateNotificationForQuery = async (req, res) => {
  const { restaurantId, tableNumber } = req.body;

  try {
    
    const restro=await Restaurant.findById(restaurantId);
    const ownerId=restro.owner._id;

    const notification = await Notification.create({
      restroId: restaurantId,
      message: `Query Call from Table Number ${tableNumber}`,
      type: "query",
    });

    await sendNotificationToOwner(ownerId, {
      title: "New Order Received",
      body: "Table 4 has placed a new order.",
    });

    await notification.save();

    const io = getIo();
    const roomId = restaurantId.toString();

    io.to(roomId).emit("newOrderNotification", notification);
    console.log(`notification emitted to room: ${roomId}`);
    return res.send(success(200, notification));
  } catch (error) {
    return res.send(501, error);
  }
};

const markAllAsRead = async (req, res) => {
  const { restaurantId } = req.body;

  if (!restaurantId) {
    return res
      .status(400)
      .json({ success: false, message: "Restaurant ID is required" });
  }

  try {
    await Notification.updateMany(
      { restroId: restaurantId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.send(success(200, "ALL notification marked read"));
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res.send(500, error);
  }
};

const getUnreadNotificationCount = async (req, res) => {
  const { restaurantId } = req.query;

  if (!restaurantId) {
    return res
      .status(400)
      .json({ success: false, message: "Restaurant ID is required" });
  }

  try {
    const unreadCount = await Notification.countDocuments({
      restroId: restaurantId,
      isRead: false,
    });

    return res.send(success(200, { unreadCount }));
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getNotification,
  generateNotificationForQuery,
  markAllAsRead,
  getUnreadNotificationCount,
};
