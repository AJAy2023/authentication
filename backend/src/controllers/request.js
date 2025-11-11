

const request  = async (req, res)=>{

    return res.status(200).json({
        success:true,
        message:"first request"
    });
}


module.exports = request