const express= require('express')
// To ensure database is connected
require('./db/mongoose')
const userRouter= require ('./routers/user')

const app=express()

// Using incoming json data 
app.use(express.json())

// Using router from another file
app.use(userRouter)

module.exports= app
