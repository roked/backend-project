import passport from 'koa-passport';
import compose  from 'koa-compose';
import User     from '../models/user.js';
import pkg      from 'passport-local';
//Get the secret code from the config
import { auth as config } from './config.js';

const {Strategy: LocalStrategy} = pkg;

//Import Strategie
import emailStrategy from '../strategies/email.js';

passport.use('email', emailStrategy);

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

export default function auth() {
  return compose([
    passport.initialize()
  ]);
}

export function authEmail() {
  return passport.authenticate('email');
}




 
