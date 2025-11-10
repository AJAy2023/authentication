
const jwt = require("jsonwebtoken");
require("dotenv").config({path:(__dirname ,  "../.env")});


function token(user) {
  return jwt.sign(
    { id: user._id },          
    process.env.JWT_TOKEN,
    { expiresIn: "10m" }
  );
}


  function refreshToken(user){
  return  jwt.sign({id:user._id}, process.env.REFRESH_TOKEN, {expiresIn:"7d"});
}





module.exports={
  token, 
  refreshToken
}
