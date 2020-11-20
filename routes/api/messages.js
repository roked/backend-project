/**
* @description User messages endpoints
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import History      from '../../models/msghisotry.js';
import { addMessage, getHistory, deleteMessage }  from '../../middleware/middlewares.js'

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

//Add new message endpoint
router.post('/message/new', addMessage);

//Get message history endpoint
router.get('/message/get', getHistory);

//Get message history endpoint
router.delete('/message/:id', deleteMessage);

//Export the router
export default router;
