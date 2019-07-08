const jwt=require('jsonwebtoken')
const app=require('../src/app')
const mongoose=require('mongoose')
const request=require('supertest')
const User=require('../src/models/user')

const userId=new mongoose.Types.ObjectId()
const followerId=new mongoose.Types.ObjectId()

const userOne={
    _id: userId,
    username: "Anket",
    password: "Anket_goyal",
    email: "goyalanket@gmail.com",
    tokens: [{
        token: jwt.sign({ _id: userId }, 'twitterapp')
    }],
    tweets: [{
        _id: userId,
        tweet: "This is my first tweet"
    }],
    followers: [{
        _id: followerId,
        follower: followerId
    }]
}

// Testing for signup
test('Should be able to signup', async () => {
    const response=await request(app).post('/users').send( {
        username: 'Anket_goyal',
        password: 'Anket_g',
        email: 'goyal@gmail.com'
    }).expect(201)
    const user=User.findById(response.body.user._id)
    expect(user).not.toBeNull()
})

beforeEach( async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

// Testing for failure
test('Should not be able to signup', async () => {
    await request(app).post('/users').send({}).expect(400)
})

// Testing for login
test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        username: userOne.username,
        password: userOne.password
    }).expect(201)
})

// Testing for login failure
test('Should not be able to login', async () => {
    await request(app).post('/users/login').send({
        username: userOne.username,
        password: "dcdd"
    }).expect(401)
})

//Testing for getting profile
test('Should be able to get profile', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
    .send({})
    .expect(200)
})

// Testing for failure
test('Should not be able to get profile', async () => {
    await request(app).get('/users/me').send({}).expect(404)
})

// Deleting account test
test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

// Testing for failure
test('Should not delete account for unauthenticate user', async () => {
    await request(app)
        .delete('/users/me')
        .send({})
        .expect(404)
})

// Testing for creating tweet
test('Should be able to create tweet', async () => {
    const response=await request(app)
        .post('/users/me/create')
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send({
            tweet: "This is my second tweet" 
        })
        .expect(200)
})

// Testing for failure
test('Should not be able to create tweet', async () => {
    await request(app)
        .post('/users/me/create')
        .send({
            tweet: "This is my tweet" 
        })
        .expect(404)
})
console.log(userOne.tweets[0])
// Testing for reading a tweet
test('Should be able to read tweet', async () => {
    await request(app)
        .post('/users/me/read/' + userOne.tweets[0]._id)
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(200)
})

// Testing for failure
test('Should not be able to read tweet', async () => {
    await request(app)
        .post('/users/me/read')
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(404)
})

// Testing for following user
test('Should be able to follow user', async () => {
    await request(app)
        .post('/users/me/follow/' + userId)
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(200)
})

// Testing for failure
test('Should not be able to follow user', async () => {
    await request(app)
        .post('/users/me/follow')
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(404)
})

// Testing for unfollowing user
test('Should be able to unfollow user', async () => {
    await request(app)
        .post('/users/me/unfollow/' + userId)
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(200)
})

// Testing for failure
test('Should not be able to unfollow user', async () => {
    await request(app)
        .post('/users/me/follow')
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(404)
})

// Testing for deleting a tweet
test('Should be able to delete tweet', async ()=> {
    await request(app)
        .post('/users/me/delete/' + userId)
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(200)
})

// Testing for failure
test('Should not be able to delete tweet', async () => {
    await request(app)
        .post('/users/me/delete')
        .set('Authorization', 'Bearer ' +userOne.tokens[0].token)
        .send()
        .expect(404)
})

