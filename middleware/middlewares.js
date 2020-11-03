/**
* @description A module which contains all middlewares used during CRUD operations
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../routes/auth.js';
import User          from '../models/user.js';
import Property      from '../models/property.js';
//Get the sign-up code from the config
import { signUpCode as secret } from '../routes/config.js';

//async middleware for handling registration
export async function register(ctx, next) {
    //Store all values from the body into variables
    const { username, email, password, signUpCode } = ctx.request.body;
    
    //User validation
    if(username && email && password && signUpCode) {
        
        //check if the sign up code is valid
        if(signUpCode !== secret){
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                message: 'The sign-up code is wrong or not completed, please try again!'
            }; 
        }
        
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
                    //redirect to the property page
                    ctx.login(user);
                    ctx.redirect('/api/property');
                } else {
                    ctx.status = 400;
                    ctx.body = { status: 'User not allowed.' };
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
export async function create(ctx) {
    //Store all values from the body into variables
    const { name, price, image, description, category, status, 
           location, features } = ctx.request.body;   
    
    console.log(name);
    
    //Set up the owner/seller of the property
//      const author = {
//         id: ctx.state.user._id,
//         username: ctx.state.user.username
//     }
    
    const author = {
        id: "5f86c536771ddc06002ad051",
        username: 'test1234'
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
        property.features = features;
        property.location = location; 
        property.author = author; 
                
        //add new property
        await property.save().then(() => {
                    ctx.body = property;
                    console.log(property)
                }).catch(err => ctx.body = err);
    } else {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            message: 'Property name already registered!'
        };
    }
}

//async middleware for retrieving all properties from the DB
export async function display(ctx) {
    try {        
        //get all properties from the DB
        const properties = await Property.find({}, (err, property) => {
            if(err){
                console.log("No properties to show");
                console.log(err);
            } else {
                ctx.body = property;         
            }
        });
        
        //Return all properties
        return properties;
    } catch(err) {
        console.log(err);
    } 
}

//async middleware for retrieving info about specific property from DB
export async function displayOne(ctx) {
    //get the property id from the request
    const id = ctx.params.id;
    //check if it exist and find the property corresponding to the id
    let property = await Property.findById(id, (err, property) => {
        if(err || !property){
            console.log("This property has no info.");
            console.log(err);
        } else {
            ctx.body = property;         
        }
    });
    
    //Return the property
    return property;
}

//TODO - add auth check
//
//async middleware that allows the user to edit a property
export async function edit(ctx, next) {
    //get the property id from the request
    const id = ctx.params.id;
    //check if it exist and find the property corresponding to the id
    let property = await Property.findById(id, (err, property) => {
        if(err || !property){
            console.log("This property has no info.");
            console.log(err);
        } else {
            console.log(property);           
        }
    });
    //Render the test page and push the properties
    await ctx.render('propertyedit', {property: property});
    
    //continue after middleware is done
    await next();
}

//async middleware to cehck if the user is the owner of the property
export async function isOwner(ctx, next) {
    //get the property id from the request and also the user loged in this session
    const id = ctx.params.id;
    let property = await Property.findById(id, (err, property) => {
        if(err || !property){
            console.log("This property has no info.");
            ctx.redirect('back');
        } else {
            console.log(property.author.id.equals(ctx.state.user._id))
            if(property.author.id.equals(ctx.state.user._id)){
                //continue after middleware is done
                console.log("User is the owner");
            } else {
                //if the owner is different it returns to main page
                ctx.redirect('/api/');
            }
        }
    });
    
    //continue after middleware is done
    await next();
}

//async middleware for updating the info of a property
export async function update(ctx, next) {
    //get all properties from the DB
    console.log(ctx.request.body.property)
    const id = ctx.params.id;
    let property = await Property.findByIdAndUpdate(id, ctx.request.body.property, (err, property) => {
        if(err || !property){
            console.log("This property has no info.");
            console.log(err);
        } else {
            console.log(property);           
        }
    });
    //Render the test page and push the properties
    await ctx.redirect("/api/property/show/" + property._id);   
    //continue after middleware is done
    await next();
}

//async middleware for deleting a property
export async function deleteProperty(ctx, next) {
    //get the property id from the request
    const id = ctx.params.id;
    //Find the property using the ID and remove it from the DB
    await Property.findByIdAndRemove(id, (err) => {
        if(err){
            console.log("This property can't be removed");
            console.log(err);
        } else {
            ctx.redirect('/api/property/show');           
        }
    });
    
    //continue after middleware is done
    await next();
}

//TODO - remove
//async middleware to clear the DB
export async function deleteAll(ctx, next) {
    //Delete everything from the DB on users and properties
    await User.deleteMany({}, (err) => {
        if(err){
            console.log(err);
        } else {
            console.log("User DB clear");          
        }
    });
    
    await Property.deleteMany({}, (err) => {
        if(err){
            console.log(err);
        } else {
            console.log("Property DB clear");          
        }
    });
    
    //continue after middleware is done
    await next();
}
