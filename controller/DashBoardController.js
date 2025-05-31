const Table = require("../Model/Table");
const Order = require("../Model/Order");
const mongoose = require("mongoose");
const { success } = require("../Utils/Utils");
const { generateDashboardData } = require("./DashBoardService");

// Helper function to get the start of the day
// const getStartOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));

// // Helper function for business hours (10 AM - 11 PM IST)
// const getBusinessHoursRange = (date) => {
//   return {
//     startTime: new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       10,
//       0,
//       0
//     ),
//     endTime: new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       23,
//       0,
//       0
//     ),
//   };
// };

// // Helper function to calculate occupancy rate within business hours
// const calculateOccupancyRate = async (startDate, endDate, restaurantId) => {
//   const totalTables = await Table.countDocuments({ restaurant: restaurantId });

//   const uniqueTables = await Order.distinct("table", {
//     restaurant: restaurantId,
//     createdAt: { $gte: startDate, $lte: endDate },
//   });

//   const occupiedTablesCount = uniqueTables.length;

//   return totalTables > 0 ? (occupiedTablesCount / totalTables) * 100 : 0;
// };

// const getAllorders = async (startDate, endDate, restaurantId) => {
//   try {
//     const orders = await Order.find({
//       restaurant: restaurantId,
//       createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
//     }).populate({
//       path: "items.menuItem",
//       select: "name categoryId",
//       populate: { path: "categoryId", select: "name" },
//     });

//     const totalOrders = orders.length;
//     const pendingOrders = orders.filter(
//       (order) =>
//         order.status === "orderConfirmed" || order.status === "preparing"
//     ).length;

//     const totalRevenue = orders.reduce(
//       (sum, order) => sum + order.totalPrice,
//       0
//     );
//     const averageOrderValue =
//       totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;

//     const dishCount = {};
//     const categoryCount = {};

//     orders.forEach((order) => {
//       order.items.forEach((item) => {
//         const dishName = item.menuItem?.name;
//         const categoryName = item.menuItem?.categoryId?.name;

//         if (dishName)
//           dishCount[dishName] = (dishCount[dishName] || 0) + item.quantity;
//         if (categoryName)
//           categoryCount[categoryName] =
//             (categoryCount[categoryName] || 0) + item.quantity;
//       });
//     });

//     const topDishes = Object.entries(dishCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([name, quantity]) => ({ name, quantity }));

//     const topCategories = Object.entries(categoryCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([name, quantity]) => ({ name, quantity }));

//     return {
//       totalOrders,
//       pendingOrders,
//       totalRevenue,
//       averageOrderValue,
//       topDishes,
//       topCategories,
//     };
//   } catch (error) {
//     console.error(error);
//   }
// };

// exports.getDashboardData = async (req, res) => {
//   try {
//     const { filter, restaurantId } = req.query;
//     const today = new Date();
//     let data = {};

//     if (filter === "daily") {
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const { startTime, endTime } = getBusinessHoursRange(today);
//       const { startTime: startOfYesterday, endTime: endOfYesterday } =
//         getBusinessHoursRange(yesterday);
//       // const occupancyRate = await calculateOccupancyRate(startTime, endTime , restaurantId);

//       let Occupancy = [];
//       for (let i = 10; i < 23; i++) {
//         // Loop only business hours 10 AM to 11 PM
//         let hourStart = new Date(today);
//         hourStart.setHours(i, 0, 0, 0);
//         let hourEnd = new Date(today);
//         hourEnd.setHours(i + 1, 0, 0, 0);

//         let rate = await calculateOccupancyRate(
//           hourStart,
//           hourEnd,
//           restaurantId
//         );
//         Occupancy.push({ hour: `${i}:00`, occupancyRate: rate });
//       }

//       const orders = await getAllorders(startTime, endTime, restaurantId);
//       const yesterdayOrders = await getAllorders(
//         startOfYesterday,
//         endOfYesterday,
//         restaurantId
//       );
//       data = { Occupancy, orders, prevOrder: yesterdayOrders };
//     } else if (filter === "weekly") {
//       let Occupancy = [];
//       let startDate = new Date();
//       startDate.setDate(today.getDate() - 6);
//       const { startTime: startOfWeek } = getBusinessHoursRange(startDate);
//       const { endTime: endOfToday } = getBusinessHoursRange(today);

//       let lastWeekStart = new Date();
//       lastWeekStart.setDate(startDate.getDate() - 7);
//       const { startTime: startOfLastWeek } =
//         getBusinessHoursRange(lastWeekStart);

//       let lastWeekEnd = new Date();
//       lastWeekEnd.setDate(today.getDate() - 7);
//       const { endTime: endOfLastWeek } = getBusinessHoursRange(lastWeekEnd);

//       for (let i = 6; i >= 0; i--) {
//         let date = new Date();
//         date.setDate(today.getDate() - i);
//         const { startTime, endTime } = getBusinessHoursRange(date);

//         let rate = await calculateOccupancyRate(
//           startTime,
//           endTime,
//           restaurantId
//         );
//         Occupancy.push({
//           hour: startTime.toISOString().split("T")[0],
//           occupancyRate: rate,
//         });
//       }

//       const orders = await getAllorders(startOfWeek, endOfToday, restaurantId);
//       const lastWeekOrders = await getAllorders(
//         startOfLastWeek,
//         endOfLastWeek,
//         restaurantId
//       );

//       data = { Occupancy, orders, prevOrder: lastWeekOrders };
//     } else if (filter === "monthly") {
//       let Occupancy = [];
//       let startDate = new Date();
//       startDate.setMonth(today.getMonth() - 6);
//       const startOfFirstMonth = new Date(
//         startDate.getFullYear(),
//         startDate.getMonth(),
//         1,
//         10,
//         0,
//         0
//       );
//       const { endTime: endOfToday } = getBusinessHoursRange(today);

//       let previousStartDate = new Date();
//       previousStartDate.setMonth(startDate.getMonth() - 6);
//       const startOfPreviousSixMonths = new Date(
//         previousStartDate.getFullYear(),
//         previousStartDate.getMonth(),
//         1,
//         10,
//         0,
//         0
//       );

//       let previousEndDate = new Date();
//       previousEndDate.setMonth(startDate.getMonth() - 1);
//       const endOfPreviousSixMonths = new Date(
//         previousEndDate.getFullYear(),
//         previousEndDate.getMonth() + 1,
//         0,
//         23,
//         0,
//         0
//       );

//       for (let i = 6; i >= 0; i--) {
//         let date = new Date();
//         date.setMonth(today.getMonth() - i);
//         let startOfMonth = new Date(
//           date.getFullYear(),
//           date.getMonth(),
//           1,
//           10,
//           0,
//           0
//         );
//         let endOfMonth = new Date(
//           date.getFullYear(),
//           date.getMonth() + 1,
//           0,
//           23,
//           0,
//           0
//         );

//         let rate = await calculateOccupancyRate(
//           startOfMonth,
//           endOfMonth,
//           restaurantId
//         );
//         Occupancy.push({
//           hour: startOfMonth.toLocaleString("default", { month: "long" }),
//           occupancyRate: rate,
//         });
//       }

//       const orders = await getAllorders(
//         startOfFirstMonth,
//         endOfToday,
//         restaurantId
//       );
//       const previousOrders = await getAllorders(
//         startOfPreviousSixMonths,
//         endOfPreviousSixMonths,
//         restaurantId
//       );
//       data = { Occupancy, orders,prevOrder:previousOrders };
//     }

//     return res.send(success(201, data));
//   } catch (error) {
//     console.error("Error fetching dashboard data", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



exports.getDashboardData = async (req, res) => {
  try {
    const { filter, restaurantId } = req.query;
    const data = await generateDashboardData(filter, restaurantId);
    return res.send(success(201, data));
  } catch (error) {
    console.error("Error fetching dashboard data", error);
    res.status(500).json({ error: "Internal server error" });
  }
};