// utilities/jwttoken.js
const jwt = require("jsonwebtoken");

function token(user) {
  return jwt.sign(
    { id: user._id },          // or just { id: user } if passing _id
    process.env.JWT_TOKEN,
    { expiresIn: "10m" }
  );
}

module.exports = token;
