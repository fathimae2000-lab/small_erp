const bcrypt =require('bcryptjs')
 const salt = bcrypt.genSaltSync(10);

const hashPassword=(password)=>{
    const hash = bcrypt.hashSync(password,salt);
    return hash
}

module.exports={hashPassword}