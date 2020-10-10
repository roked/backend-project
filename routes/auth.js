import passport from 'koa-passport';
import compose from 'koa-compose';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

//Get the secret code from the config
import { auth as config } from './config.js';

//Import Strategies
import jwtStrategy from '../strategies/jwt.js';
import emailStrategy from '../strategies/email.js';

//Set up the correct strategies for passport to use
passport.use('jwt', jwtStrategy);
passport.use('email', emailStrategy);

//Serializing and de-serializing the user information in the session
passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    (async() => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch(error) {
            done(error);
        }
    })();
});

//The default authentication function
export default function auth() {
    //Compose all middlewares
    return compose([
        passport.initialize(),
    ]);
}

//Check if user is authenticated (owns jwt)
export function isAuthenticated() {
    return passport.authenticate('jwt');
}

//Check if the user email matches the DB
export function authEmail() {
    return passport.authenticate('email');
}
// After autentication using one of the strategies, generate a JWT token
export function generateToken() {
    return async ctx => {
        //Pull out user
        const { user } = ctx.state;
    
        //Check if the user can be registred/loged in
        if(user === false) {
            ctx.status = 401;            
        } else {
            const jwtToken = jwt.sign({ id: user }, config.secret);
            const token = `JWT ${jwtToken}`;
            const currentUser = await User.findOne({ _id: user });
            ctx.status = 200;
            ctx.body = {
                token,
                user: currentUser,
            };
        }
    };
}