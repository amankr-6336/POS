const User=require('../Model/User');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const { error, success } = require('../Utils/Utils');

const SignUpController= async(req,res) =>{
    try {
        const {name,email,password} =req.body;

        if(!email || !password || !name){
            return res.send(error(400,"all fields are required"));
            // return res.status(409).send("Already have a account on this email");
         
        }

        const oldUser= await User.findOne({email});

        if(oldUser){
            return res.send(error(409,"Already have a account on this email"));
            // return res.status(409).send("Already have a account on this email");
        }
        
        const hashPassword= await bcrypt.hash(password,10);

        const user= await User.create({
            name,
            email,
            password:hashPassword
        });

        // return res.status(201).json({
        //     user,
        // });
         const newUser=await User.findById(user._id);
        return res.send(success(201,"user created"));

    } catch (e) {
        console.log(e);
        return res.send(501,"error");
    }
}



const LoginController=async(req,res) =>{
    try {
        const {email,password} =req.body;
        console.log(email,password);

        if(!email || !password ){
            return res.send(error(400,"all field are requires"));
            // return res.status(400).send("all field are requires");
        }

        const user= await User.findOne({email}).select('+password');

        if(!user){
            return res.send(error(404,"email not registered"));
            // return res.status(404).send("email not registered");
        }
        
        const matched=await bcrypt.compare(password,user.password);

        if(!matched){
                return res.send(error(403,"incorrect password"));
            // return res.status(403).send("incorrect password");
        }

        // const accessToken=generateAccessToken({_id: user._id});

        // const refreshToken=generateRefreshToken({_id: user._id});

        // res.cookie('jwt',refreshToken,{
        //     httpOnly:true,
        //     secure:true
        // })
    
        // return res.json({accessToken});

        return res.send(success(200,{user}));

    } catch (e) {
        return res.send(error(501,e.message));
    }
};
module.exports={SignUpController,LoginController};
