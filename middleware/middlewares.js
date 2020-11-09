/**
* @description A module which contains all middlewares used during CRUD operations
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../routes/auth.js';
import User          from '../models/user.js';
import Property      from '../models/property.js';
import fs            from 'fs-extra';

//Get the sign-up code from the config
import { signUpCode as secret } from '../routes/config.js';

//async middleware for handling registration
export async function register(ctx) {
    //Store all values from the body into variables
    const { username, email, password, signUpCode } = ctx.request.body;
    
    //User validation
    if(username && email && password && signUpCode) {
        //check if the sign up code is valid
        if(signUpCode !== secret.secret){
            console.log('The sign-up code is wrong or not completed, please try again!');
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                message: 'The sign-up code is wrong or not completed, please try again!'
            }; 
        } else {
            let user = await User.findOne({ email });
            let user1 = await User.findOne({ username });

            //TODO - Improve username/email check for duplicates function
            //if the user is not registred
            if(!user && !user1) {
                user = new User();

                //Add the information of the new user
                user.username = username;
                user.email = email;     
                //password is hashed and securely stored
                user.hashPassword(password);        

                await user.save();
                return passport.authenticate('email', (err, user, info, status) => {
                    if (user) {
                        console.log('Success');
                        //end
                        ctx.login(user);
                        ctx.body = user;
                    } else {
                        console.log('Error');
                        ctx.status = 400;
                        ctx.body = { status: 'error' ,
                                     message: 'User not allowed.'
                                   };
                    }
                  })(ctx);            
            } else {
                console.log('E-mail/username already registered!');
                ctx.status = 400;
                ctx.body = {
                    status: 'error',
                    message: 'E-mail/username already registered!'
                };
            }
        }
    } else {
        console.log('Email, username or password field is empty!');        
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
           location } = ctx.request.body;   
    
    //get features as they will be modified
    let { features } = ctx.request.body; 
    
    //get each image name from the request body
    const images = await getFile(ctx);
    
    //convert features from string to array
    features = features.split(',');
    
    //Set up the owner/seller of the property
    const author = {
        id: ctx.state.user._id,
        username: ctx.state.user.username
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
                    console.log("New property created!");
                }).catch(err => ctx.body = err);
    } else {
        console.log("Property name already in use!")
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
                //get the image in base64 format
                const image = loadFile(property.image[0]); 
                //replace the image name with the image file
                property.image = image;     
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
export async function deleteProperty(ctx) {
    //get the property id from the request
    const id = ctx.params.id;
    //Find the property using the ID and remove it from the DB
    await Property.findByIdAndRemove(id, (err) => {
        if(err){
            console.log("This property can't be removed");
            console.log(err);
        } else {
            console.log("Property is deleted!")
            ctx.status = 200;
            ctx.body = {
                status: 'success',
                message: 'Property is deleted!'
            };         
        }
    });    
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
    const names = [];
    console.log(images)
	if(!images || images.length === 0) {
        names.push('default.png');
        return names;
    }
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
