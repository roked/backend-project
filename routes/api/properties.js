/**
 * @module Router/properties
 * @description Property endpoints 
 * @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import multer        from '@koa/multer';
import User          from '../../models/user.js';
import Property      from '../../models/property.js';

const upload = multer();

//get all middlewares for the routes
import { create, display, displayOne, isOwner, edit, update, deleteProperty } from '../../middleware/middlewares.js';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

//Create new property endpoint
router.post('/property/new', upload.fields([{
      name: 'file',
      maxCount: 3
    }]), create);

//Get all properties
router.post('/property/show', display);

//Get info about a specific property
router.get('/property/:id', displayOne);

//Edit a property
router.get('/property/show/:id/edit', isOwner, edit);

//Update property info
router.put('/property/show/:id', upload.fields([{
      name: 'file',
      maxCount: 3
    }]), update);   

//Delete property
router.delete('/property/delete/:id', isOwner, deleteProperty);

//Export the router
export default router;