const Menu=require('../Model/Menu');
const Restaurant=require('../Model/Restaurant')
const { error, success } = require('../Utils/Utils');


const AddMenuController=async (req,res)=>{
    const {restroId,name,description,price,category}=req.body;
    try {
        const restaurant=await Restaurant.findById(restroId);

        const menu=await Menu.create({restroId,name,description,price,category});

        const savedMenu=await menu.save();
        restaurant.menu.push(savedMenu._id);
        await restaurant.save();

        return res.send(success(201,{message:"menu created",savedMenu}));
    } catch (error) {
        console.log(error);
        return res.send(501,"error");
    }
}

module.exports={AddMenuController};