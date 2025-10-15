const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
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
                message: "user User already exists exist "
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

        const generatedOtp = Math.floor(100000 + Math.random() * 100000).toString();

        // save otp to otp schema  

        await Otp.create({
            userID: newUser._id,
            otp: generatedOtp,
        });


        // send to an email 

        await verifyEmail(generatedOtp, email)

        return res.status(201).json({
            success: true,
            message: "Opt sent successfully. please verify your email .",
            userID: newUser._id,
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
    const { id, enterotp } = req.body;

    // Check if user exists
    const userexist = await User.findById(id);
    
    if (!userexist) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check OTP from otp collection  
    const otpcheck = await Otp.findOne({ userID: userexist._id });
    if (!otpcheck) {
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }

    // Compare OTPs (trim spaces)
    if (otpcheck.otp.trim() !== enterotp.trim()) {
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
    await Otp.findOneAndDelete({ userID: userexist._id });

    // Generate JWT token
    const token = jwt.sign(
      { id: userexist._id },
      process.env.JWT_TOKEN,
      { expiresIn: "10min" }
    );

    return res.status(201).json({
      success: true,
      message: "OTP verified successfully",
      data: userexist,
      token
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};








module.exports = { register, verifyOtp };