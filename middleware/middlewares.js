/**
* @description A module which contains all middlewares used during CRUD operations
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../routes/auth.js';
import User          from '../models/user.js';
import Property      from '../models/property.js';
import fs            from 'fs-extra'
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
    const { name, price, description, category, status, 
           location, features } = ctx.request.body;   
    
    //get each image name from the request body
    const images = await getFile(ctx) 
    
    console.log(images);
    
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
        property.image = images;
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
                       
                //attach the image to the property object
                for(const prop of property){
                    //get the image in base64 format
                    const image = loadFile(prop.image[0]); 
                    //replace the image name with the image file
                    prop.image = image;
                }                    
                
                //set the body which will be send to the frontend
                ctx.body = property;         
            }
        }); 
    } catch(err) {
        console.log(err);
    } 
}

//async middleware for retrieving info about specific property from DB
export async function displayOne(ctx) {
    try {   
        //get the property id from the request
        const id = ctx.params.id;
        //check if it exist and find the property corresponding to the id
        let property = await Property.findById(id, (err, property) => {
            if(err || !property){
                console.log("This property has no info.");
                console.log(err);
            } else {
                //set the body which will be send to the frontend
                ctx.body = property;         
            }
        });  
    } catch(err) {
        console.log(err);
    } 
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

/**
 * The function to get the file from the frontend and store it.
 *
 * @name Get file function
 * @params {Object} ctx - context
 * @returns {String} the name of the file which will be stored in the DB and used as reference
 */
async function getFile(ctx) {
	const images = ctx.request.files.file;
    console.log(images)
    const names = [];
	if(images.length === 0) return names.push('default.png');
	try {
        for(const image of images){
            await fs.writeFile(`public/uploads/${image.originalname}`, image.buffer, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });        
            names.push(image.originalname);
        }
        return names;
	} catch(err) {
		console.log(err.message);
	}
}

/**
 * The function to get the image from the server and format it in base64 string.
 *
 * @name Get image function
 * @params {String} fileName - the name of the image
 * @returns {String} objImg - the base64 string format of the image
 */
function loadFile(fileName) {
    //objImg will store the base64 string string
	const objImg = {img:null}
    
	try {
        //read the file from the server dir
        let bitMap= fs.readFileSync(`public/uploads/${fileName}`, (err) => {
           if (err) console.log(err);
        });                    
        
        //convert image to base64 string
        objImg.img = new Buffer.from(bitMap).toString("base64");     
        
        //return the image
        return objImg;
	} catch(err) {
		console.log(err.message);
	}
}
