/**
* A custom passport strategy used for user authentication.
* @author Mitko Donchev
*/
import User from '../models/user.js';
import pkg  from 'passport-custom';

const { Strategy: CustomStrategy } = pkg;

//Create new strategy so the user should authenticate via email not username
export default new CustomStrategy(async(ctx, done) => {
    console.log('Email Strategy: ', ctx.body);    
    const { email, password } = ctx.body;    
    try {
        //Test whether logins using email and password
        if(email && password) {
            const user = await User.findOne({email: email.toLowerCase()});
            //If neither the user(email) or password is invalid, the user won't be allowed to login
            if(!user || !user.validPassword(password)) {
                done(null, false);
                console.log('Wrong password.');
            }  
            //Login successful
            console.log('Successfully authorized!');
            done(null, user);
        } else {
            console.log('Email/password missing or wrong!');
            done(null, false);
        }
    } catch(error) {
        done(error);
    }
});