/**
 * @module Authentication/passport
 * @description JS file to take care of authentication,
 * passport initialize and user serialize/deserialize
 * @author Mitko Donchev
 */
import passport from 'koa-passport';
import compose from 'koa-compose';
import User from '../models/user.js';
// Import custom strategy
import emailStrategy from '../strategies/email.js';

// Set up the correct strategy for passport
passport.use('email', emailStrategy);

// Serializing the user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserializing the user
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

/**
 * An async function for initializing passport.
 *
 * @name Initialize Passport
 */
export default function auth() {
  return compose([
    passport.initialize(),
  ]);
}

/**
 * An async function for authorizing the user.
 *
 * @name User authorization
 * @params {Object} ctx - context
 */
export async function authEmail(ctx) {
  return passport.authenticate('email', async (err, user) => {
    // if the user is authenticated
    if (user) {
      await ctx.login(user);
      ctx.status = 200;
      ctx.body = {
        user,
        message: 'Successfully authorized. Welcome!',
      };
    } else { // if an error was triggered
      ctx.status = 400;
      ctx.body = {
        message: err.message,
      };
    }
  })(ctx);
}
