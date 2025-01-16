const Menu = require("../Model/Menu");
const Restaurant = require("../Model/Restaurant");
const { error, success } = require("../Utils/Utils");

const AddMenuController = async (req, res) => {
  const { restroId, name, description, price, categoryId ,isVeg ,isStock } = req.body;
  try {
    const restaurant = await Restaurant.findById(restroId);

    const menu = await Menu.create({
      restroId,
      name,
      description,
      price,
      categoryId,
      isVeg,
      isStock
    });

    const savedMenu = await menu.save();
    restaurant.menu.push(savedMenu._id);
    await restaurant.save();

    return res.send(success(201, { message: "menu created", savedMenu }));
  } catch (error) {
    console.log(error);
    return res.send(501, "error");
  }
};

const UpdateMenuInfoController = async (req, res) => {
  const { menuId, updates } = req.body;

  try {
    const menu = await Menu.findById(menuId);

    if (!menu) {
      return res.send(success(404, "Menu not Found"));
    }
    Object.assign(menu, updates);
    const savedMenu = await menu.save();
    return res.send(success(201, { savedMenu }));
  } catch (error) {
    console.log(error);
    return res.send(501, "error");
  }
};

const deletMenuController = async (req, res) => {
  const { menuId, restroId } = req.body;
  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.send(error(404, "menu not found"));
    }
    await Menu.findByIdAndDelete(menuId);

    await Restaurant.findByIdAndUpdate(restroId, {
      $pull: { menu: menuId },
    });

    return res.send(success(201, "menu deleted successfully"));
  } catch (error) {
    console.log(error);
    return res.send(501, "error");
  }
};

const getMenuBasedOnCategory = async (req, res) => {
  const { categoryId } = req.query;
  try {
    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }
    const menus = await Menu.find({ categoryId }).populate({
      path: "categoryId", // Field to populate
      select: "name", // Only fetch the `name` field from Category
    });;
    return res.send(success(201,{menus}))
  } catch (error) {
    console.log(error);
    return res.send(501,"error");
  }
};

module.exports = {
  AddMenuController,
  UpdateMenuInfoController,
  deletMenuController,
  getMenuBasedOnCategory
};
