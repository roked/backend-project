import Router               from '@koa/router';
import passport             from 'koa-passport';
import User                 from '../../models/user.js';
import Property             from '../../models/property.js';
//get all middlewares for the routes
import { create, display, displayOne, isOwner, edit, update, deleteProperty } from '../../middleware/middlewares.js';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api/property'
});

//TEST PAGE
//TODO - Remove after finish testing
router.get('/', async(ctx) => {
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
router.post('/new', create);

//Show all properties
router.get('/show', display);

//Check info about a specific property ifo
router.get('/show/:id', displayOne);

//Edit a property
router.get('/show/:id/edit', isOwner, edit);

//Update property info
router.put('/show/:id', update);   

//Delete property
router.delete('/show/:id', isOwner, deleteProperty);

//Export the router
export default router;