//Import JWT (jsonwebtoken) generator and email authentication 
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../auth.js';
import User          from '../../models/user.js';
import { register }  from '../../middleware/middlewares.js'

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
router.post('/login', authEmail(), async(ctx) => {
    try {
        await ctx.redirect('/api/property');
    } catch(err) {
        console.log(err.message);
    }
});

//Register endpoint
router.post('/register', register);

//Export the router
export default router;
