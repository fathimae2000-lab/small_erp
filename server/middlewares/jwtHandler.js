const {verifyToken}=require('../utils/jwtHelper')

const verifyTokenHandler=(req,res,next)=>{
    let token=req.headers['authorization']
    if(token && token.includes('Bearer')){
        try {
            let result=verifyToken(token)
            req.userId=result.id
            next()
        } catch (error) {
            res.status(401).json({message:'invalid token'})
        }
    }else{
        res.status(401).json({message:'no token provided'})
    }
}

module.exports={verifyTokenHandler}