const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    tokens: {
      type: [String],
      default:[],
    },

    isLoggedin:{
      type:Boolean,
      default:false,
    },
    refreshToken:{
      type: String,
      default:""
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
