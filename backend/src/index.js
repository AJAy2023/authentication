const express   = require("express");
const app  =  express();
require("dotenv").config({path:(__dirname, '.env')});
const authentication = require("./router/userauth.js");
const data = require("./router/requestdata.js"); 
const connectdb  = require("./config/db");
const cookieParser = require("cookie-parser");
connectdb();


const port = process.env.PORT||4000;


//midd
app.use(express.json());
app.use(cookieParser());

app.use('/api' , authentication)
app.use('/api', data);

app.get('/home' ,  (req, res)=>{
    res.send("welcome to home page!");
});




app.listen(port ,  ()=>{
    console.log(`the server  is  running  on the  port ${port}`);
})