const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const cookie =  require("cookie-parser");
const {token , refreshToken} =  require("../utilites/jwttoken");
const verifyEmail = require("../verifyOtp/nodemailer");
const Otp = require("../models/otp");
const { default: mongoose } = require("mongoose");
require("dotenv").config({ path: (__dirname, "../.env") });


const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

          // validation 
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // validate the  email  
        if (!validator.validate(email)) {
            return res.status(400).json({
                success: false,
                message: "invalid email || check the email"
            });
        }

      

        // check the  user exist or not  
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: " User already exists exist "
            });
        }

        // hash the pass  

        const hashpass = await bcrypt.hash(password, 10);

        // new user 
        const newUser = await User.create({
            username,
            email,
            password: hashpass
        });

        //  genrate the  opt

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // save otp to otp schema  

        await Otp.create({
            userId: newUser._id,
            otp: generatedOtp,
        });


        // send to an email 
      try{
          await verifyEmail(generatedOtp, email)
      }catch(err)
      {
          // clean
           await Otp.findByIdAndDelete({userId:newUser._id});
           await User.findByIdAndDelete(newUser._id)
           
           return res.status(500).json({
            success:false,
            message:"Failed to send verification  email ",
            error:err.message
           });
      }

        return res.status(201).json({
            success: true,
            message: "Opt sent successfully. please verify your email .",
            userId: newUser._id,
        });


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
}


// function 
const verifyOtp =  async (req, res)=>{
  try{
// take info 
  const {userId ,  otp} =  req.body;

  if(!mongoose.Types.ObjectId.isValid(userId))
  {
    return res.status(400).json({
      success:false,
      message:"Invalid id"
    });
  }
// validator 
    if(!userId || !otp)
    {
      return res.status(400).json({
        success:false,
        message:"All Field required."
      });
    }

    const user  =  await User.findById(userId);
    if(!user)
    {
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    //otprecord

    const otprecord = await Otp.findOne({userId:user});
    // if not otp
    if(!otprecord)
    {
      return res.status(404).json({
        success:false,
        message:"Otp is not found."
      });
    }
//otp expires 
    if(otprecord.expireAt < Date.now())
    {
      return res.status(401).json({
        success:false,
        message:"Otp has  expired"
      });
    }


//otp check with enter  otp 
if(otprecord.otp !== otp)
{
  return res.status(401).json({
    success:false,
    message:"otp not matched"
  });
}

// make user  verified and  login true

    user.isLoggedin =  true,
    user.isVerified =  true
     await user.save();

// access token  and refresh token 

  let accessTokenvalue =  token(user);
  let refreshtokenvalue  = refreshToken(user);
// save the access token and  refresh Token 
  user.tokens = [accessTokenvalue],
  user.refreshToken = refreshtokenvalue

//delete used otp 
 await  Otp.findByIdAndDelete(userId);
   await user.save();

   res.cookie("refhreshToken", refreshtokenvalue ,{
    httpOnly:true,
    secure:true,
   })

   return res.status(200).json({
    success:false,
    message:"Otp verified successfully",
    accessTokenvalue,
    refreshToken:refreshtokenvalue
   });

  }catch(err)
  {
    return res.status(500).json({
      success:true,
      message:"Internal server error",
      error:err.message
    });
  }
}


// login  

const login  = async (req, res)=>{

  try{
    const {email , password}= req.body;

    // check the  email 

    if(!validator.validate(email))
    {
      return res.status(400).json({
        success:false,
        message:"email  id  is not  valid "
      });
    }

    if(!email || !password)
    {
      return res.status(400).json({
        message:"please fill all fields"
      });
    }

      //  user check  

      const  user = await  User.findOne({email});
      
      if(!user)
      {
        return res.status(404).json({
          success:false,
          message:"user  not found"
        });
      }

    // match the pass and  genarate the token  

    const isMatch  = await bcrypt.compare(password ,  user.password); 
   
    if(!isMatch)
    {
      return res.status(401).json({
        success:false,
        message:"aunathoized user  "
      });
    }


    // here accesToken and refreshToken  

    const accessToken = token(user);
    const refreshTokenValue = refreshToken(user);

        user.isLoggedin = true;
        user.refreshToken = refreshTokenValue;
        await user.save();



         //  send  the  refresh  token wiva  cookie

     res.cookie("refreshToken", refreshTokenValue, {
        httpOnly: true,
        secure: true, 
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });


      return res.status(201).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      refreshToken: refreshTokenValue
    });


  }catch(err)
  {
    return res.status(500).json({
      success:false,
      message:"internal server error",
      error:err.message,
      
    })
  }
}



// refresh  token  

const verifytoken  = async (req, res)=>{

  try{
    //  token from cookies 
  const refreshtoken  =  req.cookies?.refreshToken || req.headers["x-refresh-token"];
   // check the  token 
    if(!refreshtoken)
    {
      return res.status(401).json({
        success:false,
        message:"Unauthorized access. Please login again."
      });
    }
  // Verify the token signature
  const decode = jwt.verify(refreshtoken , process.env.REFRESH_TOKEN );
  if(!decode)
  {
    return res.status(401).json({
      success:false,
      message:"refresh token is  invalid"
    });
  }

  //Find the user
const user  =  await User.findById(decode.id);
if(!user)
{
  return res.status(404).json({
    success:false,
    message:"user not found"
  });
}

  //Ensure this refresh token actually belongs to the user
  if(!user.refreshToken ||!user.refreshToken.includes(refreshtoken))
    {
      return res.status(403).json({
        success:false,
        message:"Refresh token not found or already used. Please login again."
      });
    }

  // Generate new access token
    const  accessTokenvalue =  token(user);
    return res.status(200).json({
      success:true,
      message:"refresh token created successfully",
      accessTokenvalue
    });


  }catch(err)
  {
    return res.status(500).json({
      success:false,
      message:"Internal Server error",
      error:err.message
    });
  }
}


// logout  

const logout =  async (req, res)=>{

 try{

  const refershtoken = req.cookies?.refreshToken || req.headers["x-refresh-token"];
  if(!refershtoken)
  {
    return res.status(401).json({
      message:"refresh token  is not found ."
    });
  }


  // verify token 

  const decode  =  jwt.verify(refershtoken , process.env.REFRESH_TOKEN);
  console.log("the decode refresh token :" , decode);
  console.log("the  user rf token :", decode.id);

  if(!decode.id)
  {
    return res.status(401).json({
      success :false,
      message:"Invalid  refreh token."
    });
  }

const user  =  await User.findById(decode.id);
if(!user)
{
  return res.status(404).json({
    success:false,
    message:"user not  found"
  });
}

user.refreshToken = "",
user.tokens = [];
user.isLoggedin = false;
await user.save();

res.clearCookie("token");
res.clearCookie("refreshtoken", {
      httpOnly: true,
      sameSite: "strict",
    });
  return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
 }catch(err)
 {
   console.error("Logout error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
     })

}
}


// resend the otp 

const resendotp = async (req, res) => {
  try {
    const { userId } =  req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingOtp = await Otp.findOne({ userId });
    if (existingOtp) {
      const timeSinceLastOtp = Date.now() - existingOtp.createdAt;

    if (timeSinceLastOtp < 2 * 60 * 1000) {
      const timeLeft = Math.ceil((2 * 60 * 1000 - timeSinceLastOtp) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} seconds before requesting another OTP.`,
      });
    }
    }

   

    await Otp.findOneAndDelete({ userId });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000);

    await Otp.create({
      userId,
      otp: generatedOtp,
    });

    await verifyEmail(generatedOtp, user.email);

    return res.status(200).json({
      success: true,
      message: "Otp resent successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};






// resetpass pass  

const resetpass =  async(req, res)=>{

  try{

    const {email} = req.body;
  const{password  , confirmpassword} = req.body;

  // validate email  
  if(!validator.validate(email))
  {
    return res.status(400).json({
      success:false,
      message:"Invalid email address. Please check  your  emailId "
    });
  }

  // required fields 
  if(!email || !password || !confirmpassword)
  {
    return res.status(400).json({
      success:false,
      message:"All fields are required"
    });
  }

  // check  user  
  const user  = await User.findOne({email});
  if(!user)
  {
    return res.status(404).json({
      success:false,
      message:"User not  found"
    });
  }

  // check the pssowrds 
  if(password  !== confirmpassword)
  {
    return res.status(401).json({
      success:false,
      message:"Missmatch password"
    });
  }

  const hashpass =  await  bcrypt.hash(password,  10);
   user.password = hashpass
   await user.save();

     return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  }catch(err)
  {
    return res.status(500).json({
      success:false,
      message:"Internal error",
      error:err.message
    });
  }

}



module.exports = { register, verifyOtp , login, logout ,  resendotp, verifytoken , resetpass};