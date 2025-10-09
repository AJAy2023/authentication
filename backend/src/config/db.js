const mongoose = require("mongoose");
require("dotenv").config({path:(__dirname , "../.env")});
const dbconnect  = async()=>{
    try
    {   
        await  mongoose.connect(process.env.MONGO_URL)

        console.log("mongodb is connected ...");

    }catch(err)
    {
    console.log("db failed to connect ...!");
    }
}

module.exports=dbconnect;