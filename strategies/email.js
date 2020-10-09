import User from '../models/user.js';
import pkg  from 'passport-custom';

const { Strategy: CustomStrategy } = pkg;

//Create new strategy so the user should authenticate via email not username
export default new CustomStrategy(async(ctx, done) => {
    console.log('Email Strategy: ', ctx.body);
    try {
        //Test whether logins using email and password
        if(ctx.body.email && ctx.body.password) {
            const user = await User.findOne({
                email: ctx.body.email.toLowerCase()
            });
            //If neither the user(email) or password is invalid, the user won't be allowed to login
            if(!user || !user.validPassword(ctx.body.password)) {
                done(null, false);
                console.log('Wrong password.');
            }  
            //Login successful
            done(null, user);
        } else {
            done(null, false);
        }
    } catch(error) {
        done(error);
    }
});