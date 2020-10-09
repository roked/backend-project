//Import JWT (jsonwebtoken) generator and email authentication 
import { authEmail, generateToken } from '../auth.js';
import User from '../../models/user.js';
import Router from '@koa/router';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

//TEST PAGE
//TODO - Remove after finish testing
router.get('/', async(ctx) => {
    try {
        await ctx.render('index');
    } catch(err) {
        console.log(err.message);
    }
});

//Login endpoint
router.post('/login', authEmail(), generateToken());

//Register endpoint
router.post('/register', register, generateToken());

//async middleware for handling registration
async function register(ctx, next) {
    //Store all values from the body into variables
    const { username, email, password } = ctx.request.body;
    
    // TODO - improve validation
    if(username && email && password) {
        let user = await User.findOne({
            email
        });
                
        //if the user is not registred
        if(!user) {
            user = new User();
            
            user.username = username;
            user.email = email;               
            user.hashPassword(password);        
            
            await user.save();
            ctx.passport = {
                user: user._id,
            };
            await next();
        } else {
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                message: 'E-mail already registered'
            };
        }
    } else {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            message: 'Invalid email or password'
        };
    }
}

//Export the router
export default router;
