import passport      from 'passport';
import localPassport from 'passport-local';
import mongoose      from 'mongoose';
import auth          from '../auth.js'

const LocalStrategy = localPassport.Strategy;



passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, async (email, password, done) => {
  await User.findOne({email: email}).then((user) => {
    if(!user || !user.validPassword(password)){
      return done(null, false, {errors: {'email or password': 'is invalid'}});
    }
    console.log("Successfuly Loged In")
    return done(null, user);
  }).catch(done);
}));
