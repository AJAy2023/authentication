const mongoose = require("mongoose");
const  otpSchema  = new mongoose.Schema({

     userId: {                     
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, 
   
    otp:{
        type:String, 
        required:true
    },  
 expireAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 5 * 60 * 1000  // expires in 5 min
  }
});

otpSchema.index({expireAt:1}, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp" , otpSchema);