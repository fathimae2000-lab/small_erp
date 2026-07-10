const errorHandler=(error,req,res,next)=>{
    res.status(error.statusCode || 500).json({
        suucess:false,
        message:error.message || "Server error"
    })
}

module.exports=errorHandler