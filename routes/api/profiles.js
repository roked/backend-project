/**
* @description User endpoints
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../auth.js';
import User          from '../../models/user.js';
import { register }  from '../../middleware/middlewares.js'

//RODO - REMOVE
//import { deleteAll } from '../../middleware/middlewares.js';

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
router.post('/user/login', authEmail(), async(ctx) => {
    try {
        await ctx.redirect('/api/property/show');
    } catch(err) {
        console.log(err.message);
    }
});

//Register endpoint
router.post('/user/register', register);

//Export the router
export default router;
