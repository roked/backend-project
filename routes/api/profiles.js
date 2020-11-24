/**
 * @module Router/profiles
 * @description User profiles endpoints
 * @author Mitko Donchev
 */
import Router from '@koa/router';
import {authEmail} from '../auth.js';
import {register, verifyUser} from '../../middleware/middlewares.js'

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

/**
 * Login endpoint.
 *
 * @name Login
 * @route {POST} /
 */
router.post('/user/login', authEmail);

/**
 * Register endpoint.
 *
 * @name Register
 * @route {POST} /
 */
router.post('/user/register', register);

/**
 * Logout endpoint.
 *
 * @name Logout
 * @route {GET} /
 */
router.get('/user/logout', async (ctx) => {
    try {
        if (ctx.isAuthenticated()) {
            ctx.logout();
        }
        ctx.status = 200;
        ctx.body = {
            message: 'Successfully logged out!'
        };
    } catch (err) {
        console.log(err.message);
        ctx.status = 400;
        ctx.body = {
            message: 'User logout failed. Please try again!'
        };
    }

});

/**
 * Profile email verification endpoint.
 *
 * @name Verify profile
 * @route {GET} /
 */
router.get('/verify/:permalink/:token', verifyUser);

//Export the router
export default router;
