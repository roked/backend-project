/**
* @description Property endpoints 
* @author Mitko Donchev
*/
import Router               from '@koa/router';
import passport             from 'koa-passport';
import User                 from '../../models/user.js';
import Property             from '../../models/property.js';
//get all middlewares for the routes
import { create, display, displayOne, isOwner, edit, update, deleteProperty } from '../../middleware/middlewares.js';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api'
});

//TEST PAGE
//TODO - Remove after finish testing
router.get('/property', async(ctx) => {
    //check if the user is loged in
    if (ctx.isAuthenticated()) {       
        console.log(ctx.isAuthenticated())
        try {
            await ctx.render('housecreate');
        } catch(err) {
            console.log(err.message);
        }
    //if not go to reg page
    } else {
        ctx.redirect('/api/');
    }    
});

//Create new property endpoint
router.post('/property/new', create);

//Get all properties
router.get('/property/show', display);

//Check info about a specific property ifo
router.get('/property/show/:id', displayOne);

//Edit a property
router.get('/property/show/:id/edit', isOwner, edit);

//Update property info
router.put('/property/show/:id', update);   

//Delete property
router.delete('/property/show/:id', isOwner, deleteProperty);

//Export the router
export default router;