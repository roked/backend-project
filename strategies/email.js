/**
 * @module Authentication/email-strategy
 * @description A custom passport strategy used for user authentication.
 * @author Mitko Donchev
 */
import User from '../models/user.js';
import pkg from 'passport-custom';

const {Strategy: CustomStrategy} = pkg;

/**
 * Create new strategy so the user should authenticate via email not username.
 *
 * @name User authentication
 * @params {Object} ctx - context
 * @params {Object} done - callback
 */
export default new CustomStrategy(async (ctx, done) => {
    //console.log('Email Strategy: ', ctx.body);
    const {email, password} = ctx.body;
    try {
        //Test whether logins using email and password
        if (email && password) {
            const user = await User.findOne({email: email.toLowerCase()});
            //if the user does not have registartion
            if (!user) {
                return done(new Error('User with this email address does not exist. Please create a new registration!'), null);
            }
            //If the user profile is not verified
            //This can be done by the verification email
            if (!user.verified) {
                return done(new Error('User not verified.'), null);
            }
            //If password is invalid the user won't be allowed to login
            if (!user.validPassword(password)) {
                return done(new Error('Wrong password! Please try again!'), null);
            }
            //Login successful
            return done(null, user);
        } else {
            return done(new Error('Email/password missing or wrong!'), null);
        }
    } catch (error) {
        return done(new Error('Something went wrong!'), null);
    }
});

