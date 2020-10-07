//USER MODEL

//import the database
import mongoose from 'mongoose';
import Passport from 'passport-local-mongoose';

//Define the user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});

// userSchema.plugin(Passport);

//Export the user model 
export default mongoose.model('User', userSchema);