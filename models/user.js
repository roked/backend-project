//============
//USER MODEL//
//============

//import the database/validator/hash/token and config
import mongo           from 'mongoose';
import mongoValidator  from 'mongoose-unique-validator';
import crypto          from 'crypto';
import config          from '../config/config.js';

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
        pass.salt = await crypto.randomBytes(128).toString('hex');
        // pass in password, salt, iterations, keylength, algorithm
        pass.hash = await crypto.pbkdf2(pass, this.salt, 100000, 64, 'sha512').toString('hex');
    } catch (err) {
        console.log(err);
    }
};

//Validate Password using the same pbkdf2 async method 
UserSchema.methods.validPassword = async (pass) => {
  const hash = await crypto.pbkdf2(pass, this.salt, 100000, 64, 'sha512').toString('hex');
  return pass.hash === hash;
};

//Export the user model 
export default mongo.model('User', UserSchema);