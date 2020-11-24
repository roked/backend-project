/**
 * @module Router/messages
 * @description Message system endpoints
 * @author Mitko Donchev
 */
import Router from '@koa/router';
import {addMessage, getHistory, deleteMessage} from '../../middleware/middlewares.js'

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});


/**
 * The add new message endpoint.
 *
 * @name Add new message
 * @route {POST} /
 */
router.post('/message/new', addMessage);

/**
 * The get message history endpoint.
 *
 * @name Get message history
 * @route {GET} /
 */
router.get('/message/get', getHistory);

//Get message history endpoint
/**
 * Delete message from history endpoint.
 *
 * @name Delete message
 * @route {DELETE} /
 */
router.delete('/message/:id', deleteMessage);

//Export the router
export default router;
