const Menu = require("../Model/Menu");
const Restaurant = require("../Model/Restaurant");
const { error, success } = require("../Utils/Utils");
const cloudinary = require("cloudinary").v2;
const axios=require('axios');
const getEmbedding = require("../Utils/EmbeddedSetting");
const redis=require('../Utils/Redis')


const AddMenuController = async (req, res) => {
  const { restroId, name, description, price, categoryId, isVeg, isStock, image } = req.body;
    const cacheKey=`Menu:${categoryId}`;
  try {
    const restaurant = await Restaurant.findById(restroId);
    
    const cloudImg = await cloudinary.uploader.upload(image, {
      folder: "PosImages"
    });

    const optimizedUrl = cloudinary.url(cloudImg.public_id, {
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "webp" }
      ]
    });

    const embedding = await getEmbedding(`${name} ${description}`);

    const menu = await Menu.create({
      restaurant:restroId,
      name,
      description,
      price,
      categoryId,
      isVeg,
      isStock,
      embedding,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.secure_url,
        optimized:optimizedUrl
      }
    });

    const savedMenu = await menu.save();
    restaurant.menu.push(savedMenu._id);
    await restaurant.save();

    await redis.del(cacheKey);

    return res.send(success(201, { message: "menu created", savedMenu }));
  } catch (e) {
    
    return res.send(error(501,e.message));
  }
};


const UpdateMenuInfoController = async (req, res) => {
  const { menuId, updates ,categoryId} = req.body;
    const cacheKey=`Menu:${categoryId}`;

  try {
    const menu = await Menu.findById(menuId);

    if (!menu) {
      return res.send(success(404, "Menu not Found"));
    }
    Object.assign(menu, updates);
    const savedMenu = await menu.save();
    await redis.del(cacheKey);
    return res.send(success(201, { savedMenu }));
  } catch (e) {
   
    return res.send(error(501,e.message));
  }
};

const deletMenuController = async (req, res) => {
  const { menuId, restroId,categoryId } = req.body;
    const cacheKey=`Menu:${categoryId}`;
  try {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.send(error(404, "menu not found"));
    }
    await Menu.findByIdAndDelete(menuId);

    await Restaurant.findByIdAndUpdate(restroId, {
      $pull: { menu: menuId },
    });

    await redis.del(cacheKey);

    return res.send(success(201, "menu deleted successfully"));
  } catch (e) {
     return res.send(error(501,e.message));
  }
};

const getMenuBasedOnCategory = async (req, res) => {
  const { categoryId } = req.query;
  const cacheKey=`Menu:${categoryId}`;
  try {
    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }
    
    const cachedData=await redis.get(cacheKey);

    if(cachedData){
      return res.send(success(201,JSON.parse(cachedData)));
    }

    const menus = await Menu.find({ categoryId }).populate({
      path: "categoryId", 
      select: "name", 
    });
    await redis.set(cacheKey,JSON.stringify(menus),'EX',43200);
    return res.send(success(201,{menus}))
  } catch (e) {
     return res.send(error(501,e.message));
  }
};

module.exports = {
  AddMenuController,
  UpdateMenuInfoController,
  deletMenuController,
  getMenuBasedOnCategory
};
