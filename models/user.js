//============
//USER MODEL//
//============

//import the database/validator/hash/token and config
import mongoose from 'mongoose';

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
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

//TODO - ADD PASSWORD SOLT _ HASH

//Export the user model 
export default mongoose.model('User', UserSchema);