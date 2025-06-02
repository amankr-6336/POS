const Category = require("../Model/CategorySchema");
const redis = require("../Utils/Redis");
const { error, success } = require("../Utils/Utils");

const createCategoryController = async (req, res) => {
  const { restaurantId, name, description } = req.body;
  const cacheKey = `category:${restaurantId}`;

  try {
    if (restaurantId || name || description) {
      return res.send(error(401, "All fields are required"));
    }
    const category = await Category.create({
      name,
      description,
      restaurantId: restaurantId,
    });
    await redis.del(cacheKey);
    return res.send(success(201, { message: "category created", category }));
  } catch (e) {
    return res.send(error(501, e.message));
  }
};

const getListOfCategoryController = async (req, res) => {
  const { restaurantId } = req.query;
  const cacheKey = `category:${restaurantId}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.send(success(201,{categories:JSON.parse(cachedData)}));
    }

    const categories = await Category.find({ restaurantId: restaurantId });
    await redis.set(cacheKey, JSON.stringify(categories), "EX", 43200);
    return res.send(success(201, { message: "category created", categories }));
  } catch (error) {
    console.log(error);
    return res.send(501);
  }
};

module.exports = { getListOfCategoryController, createCategoryController };
