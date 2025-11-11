const nodemailer = require("nodemailer");
require("dotenv").config({path:(__dirname ,  '../.env')});

const verifyEmail  =  async (generatedOtp , email)=>{

const transport = nodemailer.createTransport({
  service:'gmail',
  port:process.env.SMTP_PORT,
  auth:{
    user:process.env.SMTP_USER,
    pass:process.env.SMTP_PASS
  }
});




const mailconfiguration  = {
  from:process.env.SMTP_USER,
  to :email,
  subject:"Email verification",
  text: `Your OTP is ${generatedOtp}. It will expire in 5 minutes.`
}

    transport.sendMail(mailconfiguration, function(error){

     if(error)
     {
        throw new Error(error);
     }
      console.log("email sent successfully");
  });

}

module.exports=verifyEmail;

