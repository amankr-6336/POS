const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { error } = require("../Utils/Utils");
const User = require("../Model/User");

module.exports = async (req, res, next) => {
    // Check if Authorization header exists and is formatted correctly
    if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header is required" });
    }

    // Extract token
    const accessToken = req.headers.authorization.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE);
        req._id = decoded._id;

        // Check if user exists
        const user = await User.findById(req._id);
        if (!user) {
            return res.status(404).json({ error: "User is not available" });
        }

        // Proceed to next middleware
        next();
    } catch (err) {
        // Handle errors (e.g., invalid token)
        return res.status(401).json({ error: "Invalid access token" });
    }
};
