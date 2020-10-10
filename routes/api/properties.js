import Property from '../../models/property.js';
import Router from '@koa/router';
import { isAuthenticated } from '../auth.js';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api/property'
});

//TEST PAGE
//TODO - Remove after finish testing
router.get('/', async(ctx) => {
    try {
        await ctx.render('housecreate');
    } catch(err) {
        console.log(err.message);
    }
});

//Create new property endpoint
router.post('/new', create);
   
//TODO - move in middleware folder
//async middleware for handling property creation
async function create(ctx, next) {
    //Store all values from the body into variables
    const { name, price, image, description, category, status, 
           location, features1, features2, features3 } = ctx.request.body;
    
    //Pull out user
    //const { user, } = ctx.state;
    
    const features = [features1, features2, features3];
    const selectedFeatures = [];
    for (let feature of features){
        if(feature){
            selectedFeatures.push(feature);
        }
    }
    
    let property = await Property.findOne({ name });
    
    if(!property) {
        property = new Property();
            
        //Add the information of the new property
        property.name = name;
        property.price = price;     
        property.image = image;
        property.description = description; 
        property.category = category;
        property.status = status;
        property.features = selectedFeatures;
        property.location = location; 
               
        await property.save().then(() => {
                    console.log(property)
                }).catch(next);
    
        await next();
    } else {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            message: 'Property name already registered!'
        };
    }
}

//Export the router
export default router;