const Category=require('../Model/CategorySchema');
const { error, success } = require('../Utils/Utils');

const createCategoryController= async (req,res) =>{
    const{restroId,name,description}=req.body;

    try {
        const category = await Category.create({ name, description,restaurantId:restroId });
        return res.send(success(201,{message:"category created",category}));

    } catch (error) {
        console.log(error);
        return res.send(501)
    }
}

const getListOfCategoryController= async (req,res) =>{
    const{restroId}=req.body;

    try {
        const categories = await Category.find({ restaurantId:restroId });
        return res.send(success(201,{message:"category created",categories}));

    } catch (error) {
        console.log(error);
        return res.send(501)
    }
}

module.exports={getListOfCategoryController,createCategoryController}

