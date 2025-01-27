const User = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { error, success } = require("../Utils/Utils");

const SignUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.send(error(400, "all fields are required"));
      // return res.status(409).send("Already have a account on this email");
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.send(error(409, "Already have a account on this email"));
      // return res.status(409).send("Already have a account on this email");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const accessToken = generateAccessToken({ _id: user._id });

    const refreshToken = generateRefreshToken({ _id: user._id });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    // return res.status(201).json({
    //     user,
    // });
    const newUser = await User.findById(user._id);
    return res.send(success(201, { newUser, accessToken }));
  } catch (e) {
    console.log(e);
    return res.send(501, "error");
  }
};

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      return res.send(error(400, "all field are requires"));
      // return res.status(400).send("all field are requires");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.send(error(404, "email not registered"));
      // return res.status(404).send("email not registered");
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return res.send(error(403, "incorrect password"));
      // return res.status(403).send("incorrect password");
    }

    const accessToken = generateAccessToken({ _id: user._id });

    const refreshToken = generateRefreshToken({ _id: user._id });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
     
    return res.send(success(201,{accessToken}));

    // return res.send(success(200,{user}));
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
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_KEY, {
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
    return res.send(error(401, "refresh token is require in cookie"));
    // return res.status(401).send("refresh token is require in cookie");
  }
  const refreshToken = cookies.jwt;

  // console.log("refresh token",refreshToken);

  // if(!refreshToken){
  //      return res.send(error(401,"refresh token is required"));
  //     // return res.status(401).send("refresh token is required");
  // }

  try {
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    const _id = decode._id;
    const accessToken = generateAccessToken({ _id });

    // return res.status(201).json({accessToken});

    return res.send(success(201, { accessToken }));
  } catch (e) {
    // console.log(e);
    return res.send(error(401, "invalid refresh key"));
    // return res.status(401).send("invalid refresh key");
  }
};

module.exports = { SignUpController, LoginController ,refreshAccessTokenController };
