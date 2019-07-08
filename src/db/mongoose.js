const mongoose= require('mongoose')
const validator=require('validator')

// Using separate environment for testing
if (process.env.NODE_ENV==='test')
{  
    mongoose.connect('mongodb://127.0.0.1:27017/twitter-app-test', {
    useCreateIndex: true,
    useNewUrlParser: true
    })
}
else
{
    mongoose.connect('mongodb://127.0.0.1:27017/twitter-app', {
    useCreateIndex: true,
    useNewUrlParser: true
    })
}
