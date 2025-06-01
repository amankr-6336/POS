const User=require('../Model/User');
const{error,success} =require('../Utils/Utils');
const redis = require('../Utils/Redis');


const getOwnerInfo= async (req,res)=>{
     const cacheKey = `ownerInfo:${req._id}`;
    try {
        const cachedData=await redis.get(cacheKey);
        if(cachedData){
            return res.send(success(201,JSON.parse(cachedData)));
        }
        const user=await User.findById(req._id).populate('restaurant');
        if(!user){
            return res.send(error(404,"No user found"));
        }
        
        await redis.set(cacheKey,JSON.stringify(user),'EX',86400);
        return res.send(success(201,user));
    } catch (err) {
        return res.send(error(400,err));
    }
}

module.exports={getOwnerInfo};