const express =   require("express");
const router  = express.Router();
const request =  require("../controllers/request");
const middleware =  require("../middleware/verify");

router.get('/data' , middleware , request  );

module.exports=router;