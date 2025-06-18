const User = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {OAuth2Client}=require ('google-auth-library');
const { error, success } = require("../Utils/Utils");


const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SignUpController = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!email || !password || !userName) {
      return res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.send(error(409, "Already have a account on this email"));
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
    });

    const accessToken = generateAccessToken({ _id: user._id });

    const refreshToken = generateRefreshToken({ _id: user._id });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true, 
    });
    
    return res.send(success(201, { user, accessToken }));

  } catch (e) {
    return res.send(error(501,e.message));
  }
};

const signInGoogleController=async (req,res)=>{
  try {
    const {token}=req.body;

    const ticket=await client.verifyIdToken({
      idToken:token,
      audience:process.env.GOOGLE_CLIENT_ID
    })

    const payload=ticket.getPayload();
    const {email,name}=payload;

    let user=await User.findOne({email});

    if(!user){
       user=await User.create({
        name,
        email
       })
    }
    
    const accessToken = generateAccessToken({ _id: user._id });

    const refreshToken = generateRefreshToken({ _id: user._id });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(201, { user, accessToken }));

  } catch (e) {
     return res.send(error(501,e.message))
  }
}

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      return res.send(error(400, "All field are requires"));
    }

    const user = await User.findOne({ email }).select("+password").populate('restaurant');

    if (!user) {
      return res.send(error(404, "Email not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return res.send(error(403, "incorrect password"));
    }

    const accessToken = generateAccessToken({ _id: user._id });

    const refreshToken = generateRefreshToken({ _id: user._id });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    console.log(user);
     
    return res.send(success(201,{accessToken,user}));
  } catch (e) {
    return res.send(error(501, e.message));
  }
};

const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE, {
      expiresIn: "1y",
    });

    return token;
  } catch (error) {
    console.log(error);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE, {
      expiresIn: "1y",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token is require in cookie"));
  }
  const refreshToken = cookies.jwt;

  try {
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE);
    const _id = decode._id;
    const accessToken = generateAccessToken({ _id });
    
    return res.send(success(201, { accessToken }));
  } catch (e) {
    return res.send(error(401, "Invalid refresh key"));
  }
};
const logoutController= async (req,res)=>{
  try {
      res.clearCookie('jwt',{
          httpOnly:true,
          secure:true
      });
      return res.send(success(201,"user logout"))

  } catch (e) {
      return res.send(error(500,e.message));
  }
}

module.exports = { SignUpController, signInGoogleController , LoginController ,refreshAccessTokenController,logoutController };
