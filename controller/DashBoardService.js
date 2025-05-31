const Table = require("../Model/Table");
const Order = require("../Model/Order");

// Helper: Business Hours
const getBusinessHoursRange = (date) => ({
  startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0, 0),
  endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 0, 0)
});

// Occupancy calculation
const calculateOccupancyRate = async (startDate, endDate, restaurantId) => {
  const totalTables = await Table.countDocuments({ restaurant: restaurantId });
  const uniqueTables = await Order.distinct("table", {
    restaurant: restaurantId,
    createdAt: { $gte: startDate, $lte: endDate },
  });
  return totalTables > 0 ? (uniqueTables.length / totalTables) * 100 : 0;
};

// Order Summary
const getAllorders = async (startDate, endDate, restaurantId) => {
  const orders = await Order.find({
    restaurant: restaurantId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).populate({
    path: "items.menuItem",
    select: "name categoryId",
    populate: { path: "categoryId", select: "name" },
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "orderConfirmed" || order.status === "preparing"
  ).length;

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const averageOrderValue = totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;

  const dishCount = {}, categoryCount = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const dish = item.menuItem?.name;
      const category = item.menuItem?.categoryId?.name;
      if (dish) dishCount[dish] = (dishCount[dish] || 0) + item.quantity;
      if (category) categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
    });
  });

  const topDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, quantity]) => ({ name, quantity }));
  const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, quantity]) => ({ name, quantity }));

  return { totalOrders, pendingOrders, totalRevenue, averageOrderValue, topDishes, topCategories };
};

// Main Dashboard Generator
const generateDashboardData = async (filter, restaurantId) => {
  const today = new Date();
  let data = {};

  if (filter === "daily") {
    const { startTime, endTime } = getBusinessHoursRange(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const { startTime: startOfYesterday, endTime: endOfYesterday } = getBusinessHoursRange(yesterday);

    let Occupancy = [];
    for (let i = 10; i < 23; i++) {
      const hourStart = new Date(today);
      hourStart.setHours(i, 0, 0, 0);
      const hourEnd = new Date(today);
      hourEnd.setHours(i + 1, 0, 0, 0);
      const rate = await calculateOccupancyRate(hourStart, hourEnd, restaurantId);
      Occupancy.push({ hour: `${i}:00`, occupancyRate: rate });
    }

    const orders = await getAllorders(startTime, endTime, restaurantId);
    const prevOrder = await getAllorders(startOfYesterday, endOfYesterday, restaurantId);
    data = { Occupancy, orders, prevOrder };

  } else if (filter === "weekly") {
    let Occupancy = [];
    const startDate = new Date(); startDate.setDate(today.getDate() - 6);
    const { startTime: startOfWeek } = getBusinessHoursRange(startDate);
    const { endTime: endOfToday } = getBusinessHoursRange(today);

    const lastWeekStart = new Date(); lastWeekStart.setDate(startDate.getDate() - 7);
    const { startTime: startOfLastWeek } = getBusinessHoursRange(lastWeekStart);
    const lastWeekEnd = new Date(); lastWeekEnd.setDate(today.getDate() - 7);
    const { endTime: endOfLastWeek } = getBusinessHoursRange(lastWeekEnd);

    for (let i = 6; i >= 0; i--) {
      let date = new Date();
      date.setDate(today.getDate() - i);
      const { startTime, endTime } = getBusinessHoursRange(date);
      const rate = await calculateOccupancyRate(startTime, endTime, restaurantId);
      Occupancy.push({ hour: startTime.toISOString().split("T")[0], occupancyRate: rate });
    }

    const orders = await getAllorders(startOfWeek, endOfToday, restaurantId);
    const prevOrder = await getAllorders(startOfLastWeek, endOfLastWeek, restaurantId);
    data = { Occupancy, orders, prevOrder };

  } else if (filter === "monthly") {
    let Occupancy = [];
    const startDate = new Date(); startDate.setMonth(today.getMonth() - 6);
    const startOfFirstMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 10, 0, 0);
    const { endTime: endOfToday } = getBusinessHoursRange(today);

    const previousStart = new Date(); previousStart.setMonth(startDate.getMonth() - 6);
    const startOfPrevSixMonths = new Date(previousStart.getFullYear(), previousStart.getMonth(), 1, 10, 0, 0);
    const previousEnd = new Date(); previousEnd.setMonth(startDate.getMonth() - 1);
    const endOfPrevSixMonths = new Date(previousEnd.getFullYear(), previousEnd.getMonth() + 1, 0, 23, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setMonth(today.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 10, 0, 0);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 0, 0);
      const rate = await calculateOccupancyRate(startOfMonth, endOfMonth, restaurantId);
      Occupancy.push({ hour: startOfMonth.toLocaleString("default", { month: "long" }), occupancyRate: rate });
    }

    const orders = await getAllorders(startOfFirstMonth, endOfToday, restaurantId);
    const prevOrder = await getAllorders(startOfPrevSixMonths, endOfPrevSixMonths, restaurantId);
    data = { Occupancy, orders, prevOrder };
  }

  return data;
};

module.exports = { generateDashboardData };
