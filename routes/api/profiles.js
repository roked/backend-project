/**
* @description User endpoints
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
    try {
        //after successfull login
        ctx.session.authenticated === true;
        //get the loged user
        ctx.body = ctx.state.user;
        //send the loged user to the frontend
        return ctx.body;
    } catch(err) {
        console.log(err.message);
    }
});

//Register endpoint
router.post('/user/register', register);

//Logout endpoint
router.get('/user/logout', async (ctx) => {
    try{
        if (ctx.session.authenticated === true) {
            ctx.session.authenticated = false
            ctx.session.id = undefined
        }
        ctx.status = 200;
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
