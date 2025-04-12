const Table=require('../Model/Table');
const Order=require('../Model/Order');


// Helper function to get the start of the day
const getStartOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));

// Helper function to get occupancy rate
const calculateOccupancyRate = async (startDate, endDate) => {
  const totalTables = await Table.countDocuments();
  const occupiedTables = await Table.countDocuments({
    status: "occupied",
    updatedAt: { $gte: startDate, $lte: endDate },
  });
  return totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
};

// Controller function
exports.getDashboardData = async (req, res) => {
  try {
    const { filter } = req.query;
    const today = new Date();

    let data = {};

    if (filter === "daily") {
      const startOfToday = getStartOfDay(new Date());
      const occupancyRate = await calculateOccupancyRate(startOfToday, today);

      // Get hourly occupancy
      let hourlyOccupancy = [];
      for (let i = 0; i < 24; i++) {
        let hourStart = new Date(startOfToday);
        hourStart.setHours(i);
        let hourEnd = new Date(hourStart);
        hourEnd.setHours(i + 1);

        let rate = await calculateOccupancyRate(hourStart, hourEnd);
        hourlyOccupancy.push({ hour: `${i}:00`, occupancyRate: rate });
      }

      data = { occupancyRate, hourlyOccupancy };
    }

    else if (filter === "weekly") {
      let dailyOccupancy = [];
      for (let i = 6; i >= 0; i--) {
        let date = new Date();
        date.setDate(today.getDate() - i);
        let startOfDay = getStartOfDay(date);

        let rate = await calculateOccupancyRate(startOfDay, today);
        dailyOccupancy.push({ date: startOfDay.toISOString().split("T")[0], occupancyRate: rate });
      }

      data = { dailyOccupancy };
    }

    else if (filter === "monthly") {
      let monthlyOccupancy = [];
      for (let i = 6; i >= 0; i--) {
        let date = new Date();
        date.setMonth(today.getMonth() - i);
        let startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        let rate = await calculateOccupancyRate(startOfMonth, today);
        monthlyOccupancy.push({ month: startOfMonth.toLocaleString('default', { month: 'long' }), occupancyRate: rate });
      }

      data = { monthlyOccupancy };
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard data", error);
    res.status(500).json({ error: "Internal server error" });
  }
};