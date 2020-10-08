//============
//USER MODEL//
//============

//import the database/validator/hash/token and config
import mongo           from 'mongoose';
import mongoValidator  from 'mongoose-unique-validator';
import crypto          from 'crypto';
import jwt             from 'jsonwebtoken';
import config          from '../config/config.js';

//get the secret string used for JWT
const secret = config.secret;

//Define the user schema
const UserSchema = new mongo.Schema({
  email: {
      type: String, 
      lowercase: true, 
      required: [true, "can't be blank"], 
      match: [/\S+@\S+\.\S+/, 'is invalid'], 
      index: true,
      unique: true,
      trim: true
  },
  username: {
      type: String, 
      lowercase: true, 
      required: [true, "can't be blank"], 
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'], 
      index: true,
      unique: true,
      trim: true
  },
  image: String,
  hash: String,
  salt: String
}, {timestamps: true});

//Display error message if email/username is not available
UserSchema.plugin(mongoValidator, {message: 'Please choose a different username/email.'});

//Hash the password before storing
UserSchema.methods.setPassword = async (pass) => {
    try{
        // create a random 126 bytes salt
        this.salt = await crypto.randomBytes(128).toString('hex');
        // pass in password, salt, iterations, keylength, algorithm
        this.hash = await crypto.pbkdf2(pass, this.salt, 100000, 64, 'sha512').toString('hex');
    } catch (err) {
        console.log(err);
    }
};

//Validate Password using the same pbkdf2 async method 
UserSchema.methods.validPassword = async (pass) => {
  const hash = await crypto.pbkdf2(pass, this.salt, 100000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

//Generate JWT (jsonwebtoken) 
UserSchema.methods.generateJWT = async () => {
    try{
      let today = await new Date();
      //exp - UNIX timestamp determining when token expires
      let exp = new Date(today);
      //It will expire after 60 days
      exp.setDate(today.getDate() + 60);

      //Return token with ID/Name/Exp 
      return await jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
      }, secret);
    } catch (err) {
        console.log(err);
    }
};

//Get the JSON representation of a user for authentication
UserSchema.methods.toAuthJSON = async () => {
    try {
        return await{
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        image: this.image
      }; 
    } catch (err) {
        console.log(err);
    }
};

//Export the user model 
export default mongo.model('User', UserSchema);