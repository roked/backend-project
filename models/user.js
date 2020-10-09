//============
//USER MODEL//
//============

//import the database/validator/hash/token and config
import mongoose from 'mongoose';
import crypto   from 'crypto';

//Define the user schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: { 
    type: String,
    required: false,
    index: true,
  },
  hash: String,
  salt: String
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

//TODO - ADD PASSWORD SALT _ HASH
UserSchema.methods.hashPassword = function(pass){
    this.salt = crypto.randomBytes(36).toString('hex'); 
    this.hash = crypto.pbkdf2Sync(pass, this.salt, 40000, 512, 'sha512').toString('hex');

}

UserSchema.methods.validPassword = function(pass) {
    let hash = crypto.pbkdf2Sync(pass, this.salt, 40000, 512, 'sha512').toString('hex');
    return this.hash === hash
}

//Export the user model 
export default mongoose.model('User', UserSchema);