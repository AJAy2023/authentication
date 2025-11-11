const express  = require("express");
const router = express.Router();
const {register , verifyOtp , login, verifytoken, logout , resetpass,resendotp} = require("../controllers/userauth.js");


router.post('/register' ,  register); //done
router.post('/login', login) //done
router.post('/verify-otp', verifyOtp); //done 
router.post('/verifytoken', verifytoken)
router.post('/reset-password', resetpass )
router.post('/logout/', logout)
router.post('/resend-otp/:userId',resendotp )

module.exports=router;