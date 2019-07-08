const jwt= require('jsonwebtoken')
const User= require('../models/user')

const auth = async (req,res,next) => {
     try { 
        const token= req.header('Authorization').replace( 'Bearer ', '')
        const decoded=jwt.verify(token,'twitterapp')
        // Do make a promise call by using await to send data over the route handler
        const user= await User.findOne({ _id: decoded._id, 'tokens.token': token})
        if (!user)
        {   throw new Error()
        }
        // Give access to the route handler to have access to these token and user
        req.token=token
        req.user=user
         next()
    }
    catch(e)
    {   res.status(404).send({ error: 'Please authenticate'})}
}

module.exports=auth