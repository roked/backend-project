import passport      from 'passport';
import localPassport from 'passport-local';
import mongoose      from 'mongoose';

const LocalStrategy = localPassport.Strategy;

let User = mongoose.model('User');

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

export { passport }