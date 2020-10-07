//USER MODEL

//import the database
import mongoose        from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto          from 'crypto';
import jwt             from 'jsonwebtoken';
import config          from '../config.js';

//get the secret string used for JWT
const secret = config.secret;

//Define the user schema
let UserSchema = new mongoose.Schema({
  email: {
      type: String, lowercase: true, 
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
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

//Hash the password before storing
UserSchema.methods.setPassword = async (pass) => {
    try{
        this.salt = await crypto.randomBytes(16).toString('hex');
        this.hash = await crypto.pbkdf2Sync(pass, this.salt, 10000, 512, 'sha512').toString('hex');
    } catch (err) {
        console.log(err);
    }
};

//Validate Password
UserSchema.methods.validPassword = async (pass) => {
  var hash = crypto.pbkdf2Sync(pass, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

//Generate JWT (jsonwebtoken) token
UserSchema.methods.generateJWT = async () => {
    try{
      let today = await new Date();
      let exp = new Date(today);
      exp.setDate(today.getDate() + 60);

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
export default mongoose.model('User', UserSchema);