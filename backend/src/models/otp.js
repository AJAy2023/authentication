const mongoose = require("mongoose");
const  otpSchema  = new mongoose.Schema({

    userID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },  
    otp:{
        type:String, 
        required:true
    },  
    expireAt:{
        type:Date,
        required:true,
        default : ()=> Date.now() + 5*60*1000
    },
});

otpSchema.index({expireAt:1}, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp" , otpSchema);