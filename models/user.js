/**
 * @module models/user
 * @description The user model - contains the User schema and also two user methods
 * @author Mitko Donchev
 */
import mongoose from 'mongoose';
import crypto from 'crypto';

// Define the user schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  permalink: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  verify_token: {
    type: String,
    required: true,
  },
  // Hash is the user password - it can be only decrypt with the right algorithm and Salt
  hash: String,
  // instead of password SALT will be kept in order to encrypt and decrypt the password
  salt: String,
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

// The password is simply never stored - instead a unique salt(key) and a long hash are stored
UserSchema.methods.hashPassword = (pass) => {
  // using random bytes to get the unique salt
  this.salt = crypto.randomBytes(36).toString('hex');
  // Using synchronous Password-Based Key Derivation Function 2 (PBKDF2) to hash the password
  // By using the salt which is different for every user, the password is hashed and stored
  this.hash = crypto.pbkdf2Sync(pass, this.salt, 40000, 512, 'sha512').toString('hex');
};

// Validating the password vs the stored hash
UserSchema.methods.validPassword = (pass) => {
  // The password provided by the user is hashed again with the stored salt
  // The salt is pulled using the email provided
  const hash = crypto.pbkdf2Sync(pass, this.salt, 40000, 512, 'sha512').toString('hex');

  // Comparing if the new hash is the same as the one hashed previously
  return this.hash === hash;
};

// Export the user model
export default mongoose.model('User', UserSchema);
