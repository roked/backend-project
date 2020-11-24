/**
 * @module Router/properties
 * @description Property endpoints
 * @author Mitko Donchev
 */
import Router from '@koa/router';
import multer from '@koa/multer';
//get all middlewares for the routes
import {create, display, displayOne, isOwner, edit, update, deleteProperty} from '../../middleware/middlewares.js';

const upload = multer();

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

/**
 * Create new property endpoint.
 *
 * @name New property
 * @route {POST} /
 */
router.post('/property/new', upload.fields([{
    name: 'file',
    maxCount: 3
}]), create);

/**
 * Get all properties endpoint.
 *
 * @name All properties
 * @route {POST} /
 */
router.post('/property/show', display);

/**
 * Get property endpoint.
 *
 * @name Get property
 * @route {GET} /
 */
router.get('/property/:id', displayOne);

/**
 * Get property for edit endpoint.
 *
 * @name Edit property
 * @route {GET} /
 */
router.get('/property/show/:id/edit', isOwner, edit);

/**
 * Update property endpoint.
 *
 * @name Update property
 * @route {PUT} /
 */
router.put('/property/show/:id', upload.fields([{
    name: 'file',
    maxCount: 3
}]), update);

/**
 * Delete property endpoint.
 *
 * @name Delete property
 * @route {DELETE} /
 */
router.delete('/property/delete/:id', isOwner, deleteProperty);

//Export the router
export default router;
