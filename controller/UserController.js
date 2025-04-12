const User=require('../Model/User');
const{error,success} =require('../Utils/Utils');


const getOwnerInfo= async (req,res)=>{
    try {
        const user=await User.findById(req._id).populate('restaurant');
        return res.send(success(201,user));
    } catch (err) {
        return res.send(error(400,err));
    }
}

module.exports={getOwnerInfo};