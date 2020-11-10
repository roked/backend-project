/**
* @description JS file to take care of authentication, passport initialize and user serialize/deserialize
* @author Mitko Donchev
*/
import passport from 'koa-passport';
import compose  from 'koa-compose';
import User     from '../models/user.js';
import pkg      from 'passport-local';

const {Strategy: LocalStrategy} = pkg;

//Import Strategy
import emailStrategy from '../strategies/email.js';

//Set up the correct strategy for passport
passport.use('email', emailStrategy);

//Serializing and de-serializing the user information in the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  (async () => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  })();
});

//Function to initialize passport 
export default function auth() {
  return compose([
    passport.initialize()
  ]);
}

//Check if the user email and password matches the DB
export function authEmail() {
  return passport.authenticate('email');
}
