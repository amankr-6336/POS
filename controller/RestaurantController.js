const Restaurant=require('../Model/Restaurant');
const User=require('../Model/User');
const { error, success } = require('../Utils/Utils');

const createRestaurant= async(req,res)=>{
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


module.exports={createRestaurant}