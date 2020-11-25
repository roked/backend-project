//API Integration Testing with Jest and Supertest - User endpoints
import request from 'supertest'
import mongoose from 'mongoose'
import User from '../models/user.js';
import app from '../app'
const databaseName = 'testUser'

//Before each test connect to a Mongo DB
beforeAll(async () => {
    const url = `mongodb://127.0.0.1/${databaseName}`
    await mongoose.connect(url, { useNewUrlParser: true, 
                                 useFindAndModify: false, 
                                 useUnifiedTopology: true 
                                })
})

// Cleans up database between each test
afterEach(async () => {
  await User.deleteMany()
})

//Register a user with valid email address
describe('Register new user', () => {
    it('should create a new user', async () => {       
        const res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message', "User registered!")
    })
});

//Register a user with invalid email address
describe('Fail to register - invalid email', () => {
    it('should throw an error', async () => {       
        const res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'invalid',
                signUpCode: 'we_sell_houses_agent'
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "Error during the registration. Please try again!")
    })
});

//Try to register the same user two times (same email)
describe('User already exists', () => {
    it('should throw an error', async () => {       
        let res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm2',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "E-mail/username already registered!")
    })
});

//Try to register the same user two times (same username)
describe('User already exists', () => {
    it('should throw an error', async () => {       
        let res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'roked122@gmail.com',
                signUpCode: 'we_sell_houses_agent'
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "E-mail/username already registered!")
    })
});

//Try to do registration with invalid sign up code
describe('Wrong sign up code', () => {
    it('should throw an error', async () => {       
        const res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'invalid'
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "The sign-up code is wrong or not completed, please try again!")
    })
});

//Try to do registration with empty fields
describe('Missing field', () => {
    it('should throw an error', async () => {       
        const res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: '',
                password: '',
                email: '',
                signUpCode: ''
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "Email, username or password field is empty!")
    })
});

//Try to login without registration
describe('No registration', () => {
    it('should throw an error', async () => {       
        const res = await request(app.callback())
            .post('/api/user/login')
            .send({
                password: 'testPass',
                email: 'mhae7@laldo.com',
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "User with this email address does not exist. Please create a new registration!")
    })
});

//Try to login without verification
describe('Email not verified', () => {
    it('should throw an error', async () => {       
        let res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        res = await request(app.callback())
            .post('/api/user/login')
            .send({
                password: 'testPass',
                email: 'mhae7@laldo.com',
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "User not verified.")
    })
});

//Verify user and login
describe('Verify email', () => {
    it('should allow the user to login', async () => {       
        let res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        res = await request(app.callback())
            .get('/api/verify/donchevm/test123')
        res = await request(app.callback())
            .post('/api/user/login')
            .send({
                password: 'testPass',
                email: 'mhae7@laldo.com',
            })
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('message', "Successfully authorized. Welcome!")
    })
});

//Try to login with wrong password
describe('Wrong password', () => {
    it('should thow an error', async () => {       
        let res = await request(app.callback())
            .post('/api/user/register')
            .send({
                username: 'donchevm',
                password: 'testPass',
                email: 'mhae7@laldo.com',
                signUpCode: 'we_sell_houses_agent'
            })
        res = await request(app.callback())
            .get('/api/verify/donchevm/test123')
        res = await request(app.callback())
            .post('/api/user/login')
            .send({
                password: 'invalid',
                email: 'mhae7@laldo.com',
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "Wrong password! Please try again!")
    })
});

//Try to login with missing fields
describe('Empty credentials', () => {
    it('should thow an error', async () => {       
        let res = await request(app.callback())
            .post('/api/user/login')
            .send({
                password: '',
                email: '',
            })
        expect(res.statusCode).toEqual(400)
        expect(res.body).toHaveProperty('message', "Email/password missing or wrong!")
    })
});
