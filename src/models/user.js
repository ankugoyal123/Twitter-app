const mongoose= require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

// Getting the Schema
const Userschema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    tweets: [{
        tweet: {
        type: String,
        }
    }],
    followers: [{
        follower: {
            type: String
        }
    }],
    password: {
        type: String,
        trim: true,
        minlength : 7,
        required: true,
        // Custom validator
        validate(value) {
            if (value.includes('password'))
            {   throw new Error("Password can't be used")
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            // Inbuilt validator function
            if (!validator.isEmail(value))
            {
                console.log('Invalid Email')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required:true
        }
    }],
 }, {   timestamps: true
    }
    
)

// Creating user specific user defined function
Userschema.methods.generateAuthToken= async function () {
    const user=this
    const token=jwt.sign({_id: user._id.toString()},'twitterapp')
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

Userschema.methods.getPublicProfile= function() {
    const user=this
    const UserObject =user.toObject()
    delete UserObject.password
    delete UserObject.tokens
    return UserObject
}

// Setting up credential matching for logging a user
Userschema.statics.findByCredentials= async (username,password) => {
    const user= await User.findOne({username})
    if (!user)
    {   throw new Error("Username or password doesn't exist")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if (!isMatch)
    {   throw new Error("Username or password doesn't exist")
    }
    return user
}
// Hash the password before saving
Userschema.pre('save', async function (next) {
    const user=this
    
     if (user.isModified('password')) {
         user.password=await bcrypt.hash(user.password,8)
     }
    next()
}) 

const User= mongoose.model('users', Userschema)
module.exports = User
