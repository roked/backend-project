//===========
//MIDDLEWARES
//===========

import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../routes/auth.js';
import User          from '../models/user.js';
import Property      from '../models/property.js';

//async middleware for handling registration
export async function register(ctx, next) {
    //Store all values from the body into variables
    const { username, email, password } = ctx.request.body;
    
    //User validation
    if(username && email && password) {
        let user = await User.findOne({ email });
        let user1 = await User.findOne({ username });
              
        //TODO - Improve username/email check for duplicates function
        //if the user is not registred
        if(!user || !user1) {
            user = new User();
            
            //Add the information of the new user
            user.username = username;
            user.email = email;     
            //password is hashed and securely stored
            user.hashPassword(password);        
            
            await user.save();
            return passport.authenticate('email', (err, user, info, status) => {
                if (user) {
                  ctx.login(user);
                  ctx.redirect('/api/property');
                } else {
                  ctx.status = 400;
                  ctx.body = { status: 'error' };
                }
              })(ctx);
            
            //continue after middleware is done
            await next();
        } else {
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                message: 'E-mail/username already registered!'
            };
        }
    } else {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            message: 'Email, username or password field is empty!'
        };
    }
}

//async middleware for handling property creation
export async function create(ctx, next) {
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
        
        //continue after middleware is done
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
export async function display(ctx, next) {
    //get all properties from the DB
    let property = await Property.find({}, (err, property) => {
        if(err){
            console.log("No properties to show");
            console.log(err);
        } else {
            console.log(property);           
        }
    });
    //Render the test page and push the properties
    await ctx.render('display', {properties: property});
    
    //continue after middleware is done
    await next();
}

//async middleware for displaying as pecific property info
export async function displayOne(ctx, next) {
    //get all properties from the DB
    const id = ctx.params.id;
    let property = await Property.findById(id, (err, property) => {
        if(err || !property){
            console.log("This property has no info.");
            console.log(err);
        } else {
            console.log(property);           
        }
    });
    //Render the test page and push the properties
    await ctx.render('displayOne', {property: property});
    
    //continue after middleware is done
    await next();
}
