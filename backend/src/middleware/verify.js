// middleware/verify.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config({ path: __dirname + "/../.env" });

const verify = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid format.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};

module.exports = verify;
