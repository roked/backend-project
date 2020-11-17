/**
* @description User profiles endpoints
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../auth.js';
import User          from '../../models/user.js';
import { register }  from '../../middleware/middlewares.js'

//TODO - REMOVE
//import { deleteAll } from '../../middleware/middlewares.js';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

//Login endpoint
router.post('/user/login', authEmail(), async(ctx) => {
    //get the loged user 
    //after successfull authorization
    ctx.body = ctx.state.user;
    //send the loged user to the frontend
    return ctx.body;
});

//Register endpoint
router.post('/user/register', register);

//Logout endpoint
router.get('/user/logout', async (ctx) => {
    try{
        if (ctx.isAuthenticated()) {
            ctx.logout();
        }
        ctx.body = {
            status: 'success',
            message: 'User loged out!'
        }; 
    } catch(err) {
        console.log(err.message);
    }
      
});

//Export the router
export default router;
