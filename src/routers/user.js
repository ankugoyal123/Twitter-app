const User =require('../models/user')
const express= require('express')
const auth=require('../middleware/auth')
const router= new express.Router()

// Enabling user to view his/her own data
router.get('/users/me',auth, async (req,res) => {
         res.status(200).send(req.user)
})

// Setting a route for deleting the token when user logouts
router.post('/users/logout', auth, async (req,res) =>
{   
    try {
        // Applying filter method to remove the specific user token
        req.user.tokens=req.user.tokens.filter((token) => {
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }
    catch (e)
    {   res.status(401).send(e)}
})

// Making a route handler to logout of all sessions
router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }
    catch (e)
    {   res.status(500).send()
    }
})

router.post('/users', async (req,res) => {
    // Creating a user model
    const user=new User(req.body)
    try {
        await user.save()
        // Generating user token for new users
        const token=user.generateAuthToken()
        res.status(201).send({ user, token })
    }
    catch (e)
    {   res.status(400).send(e)
    }
})

// Logging a user
router.post('/users/login', async (req,res) => {
    try {
        const user=await User.findByCredentials(req.body.username,req.body.password)
        // Generating user specific token
        const token = await user.generateAuthToken()
        res.status(201).send({user: user.getPublicProfile(),token})
    }
    catch (e)
    {   res.status(401).send("Login failed")
    }
})

// Fetching through dynamic data 
router.get('/users/:id', async(req,res) => {
    // For accessing parameters of the request
    const _id= req.params.id
    User.findById(_id).then((users) => {
        if (!users)
        return res.status(404).send()
        res.send(users)
    }).catch((e) => {
        res.status(500).send(e)
    })
})

// Integrating authentication in update route handler
router.patch('/users/me',auth,  async (req,res) => {
        const updates=Object.keys(req.body)
        try {
            updates.forEach( (update) => req.user[update] =req.body[update])
            await req.user.save()  
          
            res.send(req.user)
        }
        catch (e) {
            res.status(400).send(e)
        }
    })
    
// Integrating authentication so we are delete only specific user
router.delete('/users/me', auth, async (req,res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
         await req.user.deleteOne()
        res.send(user)
    }
    catch (e) {
        res.status(500).send()
    }
})

// Create tweet
router.post('/users/me/create', auth, async (req,res) => {
    try {
        const tweet= {
            tweet: JSON.stringify(req.body.tweet)
        }
        req.user.tweets.push(tweet)
        await req.user.save()
        res.send(tweet)
    }
    catch (e) {
        res.status(500).send("Please authenticate")
    }
    
})

// Read tweet
router.post('/users/me/read/:id', auth, async (req,res) => {
    try {
    req.user.tweets.forEach( function(tweet) {
        if (tweet._id.toString() === req.params.id)
        {   return res.send(tweet.tweet)}
    })
    }
    catch (e) {
        res.status(404).send("No tweet found")
    }
})

// Delete tweet
router.post('/users/me/delete/:id', auth, async (req,res) => {
    try {
        req.user.tweets=req.user.tweets.filter( function (tweet) {
            return tweet._id.toString()!==req.params.id.toString()
        })
        await req.user.save()
        res.send('Tweet deleted succesfully')
    }
    catch (e)
    {
        req.status(404).send('No tweet found')
    }
})

// Delete all tweets
router.post('/users/me/deleteall', auth, async (req,res) => {
    try {
        req.user.tweets=[]
        await req.user.save()
        res.send("All tweets deleted succesfully")
    }
    catch (e)
    {   res.send('Please authenticate')}
})

// Follow a user
router.post('/users/me/follow/:id', auth, async (req,res) => {
    
    try {
        const user=await User.findOne({ _id : req.params.id})
       if (!user)
        {   
            return error('No user found')
        }
        else
        {   // Checking whether already following that user or not
            user.followers.forEach( function(follower) {
                if (follower.follower.toString() === req.user._id.toString())
                {   return error("You are already following this user")
                }
        })
        }
        const follower= {
            follower: req.user._id.toString()
        }
        user.followers.push(follower)
        await user.save()
        res.status(200).send('You are now following this user')
         
    }
    catch (e)
    {   res.status(404).send('Invalid user or already following this user')}
})

// Unfollow a user
router.post('/users/me/unfollow/:id', auth, async (req,res) =>{
    try {
        const user=await User.findOne({ _id : req.params.id.toString()})
       if (!user)
        {   
            return error('No such user exists')
        }
        else
        {   
            user.followers=user.followers.filter( function(follower) {
                return follower.follower.toString()!==req.user._id.toString()
            })
            await user.save()
            res.send("You don't follow this user anymore")
        }
        }
        catch (e)
        {   res.status(404).send("No such user exists")
        }
})

// Liking a tweet
router.post('/users/me/like/:id1&:id2',auth, async (req,res) => {
    try {
        const user=await User.findOne({ _id : req.params.id1.toString() })
        if (!user)
        {   return error("User doesn't exist")}
        else
        {   // Checking following this user or not
            user.followers.forEach( function(follower) {
                if (follower.follower.toString() === req.user._id.toString())
                {   user.tweets.forEach( function(tweet) {
                    if (tweet._id.toString()===req.params.id2.toString())
                    {
                        return res.send("You like this tweet")
                    }
                })
                return res.send("Can't find this tweet")
                }
        })
        }
        return res.send("Follow this user to like/unlike the tweet")
    }
    catch(e) {
        res.status(500).send("No such user exists")
    }
})

// Unlike a tweet
router.post('/users/me/unlike/:id1&:id2',auth, async (req,res) => {
    try {
        const user=await User.findOne({ _id : req.params.id1.toString() })
        if (!user)
        {   return error("User doesn't exist")}
        else
        {   // Checking following this user or not
            user.followers.forEach( function(follower) {
                if (follower.follower.toString() === req.user._id.toString())
                {   user.tweets.forEach( function(tweet) {
                    if (tweet._id.toString()===req.params.id2.toString())
                    {
                        return res.send("You have unliked this tweet")
                    }
                })
                return res.send("Can't find this tweet")
                }
        })
        }
        return res.send("Follow this user to like/unlike the tweet")
    }
    catch(e) {
        res.status(500).send("No such user exists")
    }
})

// Retweet
router.post('/users/me/retweet/:id1&:id2',auth, async (req,res) => {
    try {
        const user=await User.findOne({ _id : req.params.id1.toString() })
        if (!user)
        {   return error("User doesn't exist")}
        else
        {   // Checking whether following this user or not
            user.followers.forEach(function(follower) {
                if (follower.follower.toString() === req.user._id.toString())
                {   user.tweets.forEach( function(tweet) {
                    if (tweet._id.toString()===req.params.id2.toString())
                    {
                        const twt={
                            tweet: tweet.tweet.toString()
                        }
                        req.user.tweets.push(twt)
                        req.user.save()
                        return res.send("You have shared this tweet")
                    }
                    })
                    return res.send("Can't find this tweet")
                }
                })
        }
        return res.send("Follow this user to share this tweet")
    }
    catch(e) {
        res.status(500).send("No such user exists")
    }
})

module.exports= router