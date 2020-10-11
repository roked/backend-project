import Router from '@koa/router';
import User from '../../models/user.js';
import Property from '../../models/property.js';
import passport from 'koa-passport';

//Setting up default path to be /api
const router = new Router({
    prefix: '/api/property'
});

//TEST PAGE
//TODO - Remove after finish testing
router.get('/', async(ctx) => {      
    if (ctx.isAuthenticated()) {       
        console.log(ctx.isAuthenticated())
        try {
            await ctx.render('housecreate');
        } catch(err) {
            console.log(err.message);
        }
    } else {
        ctx.redirect('/api/');
    }
    

});

//Create new property endpoint
router.post('/new', create);

//Show all properties
router.get('/show', display);
   
//TODO - move in middleware folder
//async middleware for handling property creation
async function create(ctx, next) {
    //Store all values from the body into variables
    const { name, price, image, description, category, status, 
           location, features1, features2, features3 } = ctx.request.body;   
    
    //Set up the owner/seller of the property
     const author = {
        id: ctx.state.user._id,
        username: ctx.state.user.username
    }
    
    //store all features from the checkboxes 
    const features = [features1, features2, features3];
    const selectedFeatures = [];
    
    //get only the checked features
    for (let feature of features){
        if(feature){
            selectedFeatures.push(feature);
        }
    }
    
    //try to get an existing property with the same name/title
    let property = await Property.findOne({ name });
    
    //checks if the property already exists
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
        property.author = author; 
                
        //add new property
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

//async middleware for displaying all properties 
async function display(ctx, next) {
    await Property.find({}, (err, property) => {
        if(err){
            console.log("No properties to show");
            console.log(err);
        } else {
            console.log(property);
            ctx.render('display', property);            
        }
    });
    await next();
}

//Export the router
export default router;