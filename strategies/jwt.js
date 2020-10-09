import User from '../models/user.js';
import { auth } from '../routes/config.js';
import pkg from 'passport-jwt';
const { Strategy: JWTStrategy, ExtractJwt } = pkg;

//Store the user JWT and Secret key in an object
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: auth.secret,
};

//Check if the token mathes payload ID
export default new JWTStrategy(opts, async (jwtPayload, done) => {
  const user = await User.findById(jwtPayload.id);
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});