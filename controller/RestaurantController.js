const Restaurant=require('../Model/Restaurant');
const User=require('../Model/User');
const Menu=require('../Model/Menu');
const { error, success } = require('../Utils/Utils');

const createRestaurantController= async(req,res)=>{
    const{name,address,phone,ownerId}=req.body;

    try {
        const owner=await User.findById(ownerId);
        if(!owner){
            return res.send(error(404,"owner is required"));
        }

        const restaurant=new Restaurant({
            name,
            address,
            phone,
            owner:ownerId
        });

        const savedRestaurant=await restaurant.save();

        return res.send(success(201,{message: "restro created successfully",restaurant:savedRestaurant}))
    } catch (error) {
        console.log(error);
        return res.send(501,"error");
    }
}

const getRestaurantInfoController= async (req,res)=>{
    const {RestaurantId}=req.body;
    try {
        const restaurant= await Restaurant.findById(RestaurantId).populate('tables').populate('menu').populate('owner');
        if(!restaurant){
            return res.send(error(404,"no matching found"));
        }
        // return res.send(success,(200,{message:"info received successfully",restaurant}));
        return res.send(success(201,{message: "restro created successfully",restaurant:restaurant}))

    } catch (error) {
        console.log(error);
        return res.send(500,error);
    }

}


module.exports={createRestaurantController,getRestaurantInfoController}