const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const {token , refreshToken} = require("../utilites/jwttoken");
const verifyEmail = require("../verifyOtp/nodemailer");
const Otp = require("../models/otp");

require("dotenv").config({ path: (__dirname, "../.env") });

const register = async (req, res) => {

    try {
        const { username, email, password } = req.body;

        // validate the  email  
        if (!validator.validate(email)) {
            return res.status(400).json({
                success: false,
                message: "invalid email || check the email"
            });
        }

        // validation 
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "fill all the  Fields.."
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

const verifyOtp = async (req, res) => {
  try {
    const { userId, enterotp } = req.body;
    // Check if user exists
    const userexist = await User.findOne({_id:userId});

    if (!userexist) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check OTP from otp collection  
    const otpcheck = await Otp.findOne({userId:userexist});

    if (!otpcheck) {
      return res.status(404).json({
        success: false,
        message: "OTP not found"
      });
    }
    // Compare OTPs (trim spaces)
    if (otpcheck.otp !== enterotp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP"
      });
    }


    // Check if OTP expired
    if (otpcheck.expireAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    // Mark user as verified
       userexist.isVerified = true;
      await userexist.save();

    // Delete OTP after successful verification
    await Otp.findOneAndDelete({ userId: userexist});

    // Generate JWT token
   
    const usertoken  = token(userexist);

    console.log("the  usetoken : ",  usertoken); //  undfine 
   

    return res.status(201).json({
      success: true,
      message: "OTP verified successfully",
      data: userexist,
      usertoken
    
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};


// login  

const login  = async (req, res)=>{

  try{
    const {email ,  password}= req.body;

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

      let accesToken = token(user)
      let refreshToken = refreshToken(user);

      user.isLoggedin =  true,
      user.isVerified =  true,
      user.refreshToken = true
        await user.save();


      return res.status(201).json({
        success:true,
        message:"user  logged in  successfully",
        accesToken,
        refreshToken
      });

  }catch(err)
  {
    return res.status(500).json({
      success:false,
      message:"internal server error",
      error:err.message
    })
  }
}



// logout  

const logout  =async (req, res)=>{

  try
  {
  // here if i click on logout then i remove from is logeed in and  remove the  token  

  const { userId } = req.params;

  console.log("the user paraid  : ",  userId);
  // find user  

  const checkuser  = await  User.findById(userId);
  if(!checkuser)
  {
    return res.status(404).json({
      success:false,
      message:"user not  found  "
    });
  }

  // is  user there  then next  

   checkuser.tokens = null,
    checkuser.isLoggedin = false,
     await  checkuser.save();

     return res.status(201).json({
      success:"successfully  logout",
      data:checkuser
     })

  }catch(err)
  {
    return res.status(500).json({
      success:false,
      message:"internal server  error"
    });
  }
}


// resend the otp 



const resendotp =  async (req, res)=>{

  try{

    const {userId} =  req.params;

// check the  user  valid or not  

const  userexist  = await User.findById(userId);

if(!userexist)
{
  return res.status(404).json({
    success:false,
    message:"user  not found"
  });
}
// check the  otp is  exist or not in db if yes then delete it  

const checkotp  = await Otp.findByIdAndDelete({userId:userId._id});
if(!checkotp)
{
  return res.status(404).json({
    success:false,
    message:"otp not  found"
  });
}

//  if every thing is  okay then return the  otp again 

let   generatedOtp = Math.floor(10000 + Math.random() * 900000)

  await  Otp.create({
    userId:userexist._id,
     otp:generatedOtp
  })

   await verifyEmail(generatedOtp , email)

    return res.status(201).json({
      success:true,
      message:"otp resent again  please check the mailBox..! "
    })

  }catch(err)
  {
      return res.status(500).json({
        success:false,
        message:"internal server error ",
        error:err.message
      });
  }
}



// forget pass  

const forgetpass =  async (req, res)=>{
  try{
    const {email} =  req.body;

// check the  user  

const userfind = await  User.findOne({email});
if(!userfind)
{
   return res.status(404).json({
    success:false,
    message:"internal server error"
   });
}

// allow  user to write the  pass  
const {password} =  req.body;

// hash the  pass

const hashpass = await bcrypt.hash(password , 10);
if(!hashpass)
{
  return res.status(400).json({
    success:false,
    message:"unathorized access"
  });
}

//  reconfrom the  pass  
const isMatch = await bcrypt.compare(password , userfind.password);

  }catch(err)
  {
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
}



module.exports = { register, verifyOtp , login, logout ,  resendotp};