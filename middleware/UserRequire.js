const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { error } = require("../Utils/Utils");
const User = require("../Model/User");

module.exports = async (req, res, next) => {
    // Check if Authorization header exists and is formatted correctly
    const authHeader = req.headers.authorization;
    const guestToken = req.headers["guest-token"];
  
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE);
        req._id=decoded._id;
        return next();
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  
    // Allow guest token for customers
    if (guestToken) {
      req.guest = { guestId: guestToken }; // Attach guest info to request
      return next();
    }
  
    return res.status(401).json({ message: "Unauthorized" });
};
