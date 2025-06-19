const QRCode = require("qrcode");
const Table = require("../Model/Table");
const Restaurant = require("../Model/Restaurant");
const { error, success } = require("../Utils/Utils");
const redis = require("../Utils/Redis");
const e = require("cors");

const CreateTableController = async (req, res) => {
  const { restroId, tableNumber, tableCapacity } = req.body;
  const qrCodeData = `https://order-restopia.netlify.app/${restroId}/${tableNumber}`;
  const qrCode = await QRCode.toDataURL(qrCodeData);
  const cacheKey = `tables:${restroId}`;

  try {
    const restaurant = await Restaurant.findById(restroId);

    const table = await Table.create({
      restroId,
      tableNumber,
      tableCapacity,
      qrCode,
    });

    const savedTable = await table.save();
    restaurant.tables.push(savedTable._id);
    await restaurant.save();
    await redis.del(cacheKey);
    return res.send(success(201, { message: "table created", savedTable }));
  } catch (e) {
    return res.send(error(501, e.message));
  }
};

const getTablesController = async (req, res) => {
  const { restaurantId } = req.query; // Assuming the restaurant ID is passed as a URL parameter

  const cacheKey = `tables:${restaurantId}`;
  try {
    // Validate the input
    if (!restaurantId) {
      return res.status(400).send(error(400, "Restaurant ID is required"));
    }

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.send(success(201, JSON.parse(cachedData)));
    }

    // Find tables for the specified restaurant
    const tables = await Table.find({ restroId: restaurantId })
      .populate("currentOrderId")
      .lean();

    // Check if tables are found
    //   if (!tables || tables.length === 0) {
    //       return res.status(404).send(error(404, "No tables found for the specified restaurant"));
    //   }

    // Send the response
    await redis.set(cacheKey, JSON.stringify(tables), "EX", 43200);
    return res
      .status(200)
      .send(success(200, { message: "Tables fetched successfully", tables }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getTableInformation = async (req, res) => {
  const { restaurantId, tableNumber } = req.query;

  try {
    const table = await Table.findOne({ restaurantId, tableNumber }).populate(
      "currentOrderId"
    );
    const restro = await Restaurant.findById(restaurantId);

    return res.send(success(200, { message: "okay", table, restro }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  CreateTableController,
  getTablesController,
  getTableInformation,
};
