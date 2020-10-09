import User from '../models/user.js';
import pkg from 'passport-custom';

const { Strategy: CustomStrategy } = pkg;

//Create new strategy so the user should authenticate via email not username
export default new CustomStrategy(async (ctx, done) => {
  console.log('Email Strategy: ', ctx.body);

  try {
    // Test whether logins using email and password
    if (ctx.body.email && ctx.body.password) {
      const user = await User.findOne({ email: ctx.body.email.toLowerCase() });

      if (!user) {
        done(null, false);
      }

      done(null, user);
      // TODO - check password
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});