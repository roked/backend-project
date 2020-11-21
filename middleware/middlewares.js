/**
* @description A module which contains all middlewares and methods used during CRUD operations
* @author Mitko Donchev
*/
import Router        from '@koa/router';
import passport      from 'koa-passport';
import { authEmail } from '../routes/auth.js';
import User          from '../models/user.js';
import Property      from '../models/property.js';
import History       from '../models/msghisotry.js';
import fs            from 'fs-extra';
import nodemailer    from 'nodemailer';
import randomstring  from 'randomstring';

//Get the sign-up code from the config
import { signUpCode as secret } from '../routes/config.js';

//=================//
//ACCOUNTS
//=================//

//this method will send verificastion emails
function sendEmail(username, reciever, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'roked122@gmail.com',
            pass: 'emtjvksoxrovuaqo'
        }
    });
    
    const mailOptions = {
      from: 'register@confirmation.ac.uk',
      to: reciever,
      subject: 'Please verify you registartion',
      text: `Thank you for the registartion, ${username}! Please click the link to verify your account: ` + message
    };    
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          console.log(err);
      } else {
          console.log('Email sent: ' + info.response);
          return true;
      }
    });  
}

//async function for handling registration
export async function register(ctx) {
    //Store all values from the body into variables
    const { username, email, password, signUpCode } = ctx.request.body;
    try {
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
                console.log(user)

                //if the user is not registred
                if(!user && !user1) {
                    user = new User();

                    const verification_token = randomstring.generate({length: 64});
                    const permalink = username.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();

                    //Add the information of the new user
                    user.username = username;
                    user.email = email;     
                    //password is hashed and securely stored
                    user.hashPassword(password);        
                    user.permalink = permalink;
                    user.verify_token = verification_token;
                    user.verified = false;

                    await user.save((err) => {
                        if (err) {
                            throw err;
                        } else {
                            const message = `https://program-nissan-3000.codio-box.uk/api/verify/${permalink}/${verification_token}`;
                            const result = sendEmail(username, email ,message);
                            if(result) {
                                console.log("User registrated!");
                            } else {
                                console.log("Error!");
                            }
                        }
                    });        
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
    } catch (err) {
        console.log(err);
    }
}

//method to verify user's email
export async function verifyUser(ctx) {
        const {permalink, token} = ctx.params;
        await User.findOne({permalink: permalink}, (err, user) => {
            if (user.verify_token == token) {
                User.findOneAndUpdate({permalink: permalink}, {verified: true}, (err, res) => {
                    console.log('The user has been verified!');
                    ctx.status = 200;
                    ctx.body = {
                        message: 'User verified!'
                    }
                });
            } else {
                console.log('The token is wrong! Token should be: ' + user.verify_token);
                ctx.status = 400;
                ctx.body = {
                        message: 'User not verified!'
                    }
            }
        });
}

//=================//
//PROPERTIES
//=================//

//async function for handling property creation
export async function create(ctx) {
    //Store all values from the body into variables
    const { name, price, description, category, status, 
           location } = ctx.request.body;   
    
    //get features as they will be modified
    let { features } = ctx.request.body;     
    
    //get each image from the request body
    const images = await getFile(ctx);
    
    //convert features from string to array
    features = features.split(',');
    let finalFeatures = [];
    for(const feat of features) {
        if(feat === 'true') { 
            finalFeatures.push(true) 
        } else {finalFeatures.push(false)}
    }
    
    console.log(finalFeatures)
    
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
        property.features = finalFeatures;
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

//async function for retrieving all properties from the DB
export async function display(ctx) {
    let query = {status: { $ne: "Unpublished" }};
    //set the query if user
    if(ctx.request.body.user && ctx.state.user._id){
        const user = ctx.state.user;
        const id = parseInt(user._id);
        query = { author: { id: user._id, username: user.username } };
    }
    try {        
        //get all properties from the DB
        const properties = await Property.find(query, (err, property) => {
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
                console.log(property);
                //set the body which will be send to the frontend
                ctx.body = property;         
            }
        }); 
    } catch(err) {
        console.log(err);
    } 
}

//async function for retrieving info about specific property from DB
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

//async function that allows the user to edit a property
export async function edit(ctx) {
    try{
        //get the property id from the request
        const id = ctx.params.id;
            //check if it exist and find the property corresponding to the id
            let property = await Property.findById(id, (err, property) => {
                if(err || !property){
                    throw new Error("Fail!");
                } else {
                    //set the body which will be send to the frontend
                    ctx.body = property;  
                }
            });  
    } catch(err) {
        console.log(err);
        //if the owner is different throw error
        throw new Error("Something went wrong with the update!");
    } 
}

//async middleware to cehck if the user is the owner of the property
export async function isOwner(ctx, next) {
    try{
        //get the property id from the request and also the user loged in this session
        const id = ctx.params.id;
        await Property.findById(id, (err, property) => {
            if(err || !property){
               throw new Error("This property has no info!");
            } else {
                if(property.author.id.equals(ctx.state.user._id)){
                    //continue after middleware is done
                    console.log("User is the owner");
                } else {
                    //if the owner is different throw error
                    throw new Error("User is not the owner!");
                }
            }
        });        
    } catch(err) {
        console.log(err);
        //if the owner is different throw error
        throw new Error("User is not the owner!");
    } 
    await next();
}

//async function for updating the info of a property
export async function update(ctx) {
    try{
        let images; //property image 
        //Store all values from the body into variables
        const { name, price, description, category, status, 
               location } = ctx.request.body;
        let { features } = ctx.request.body;  //get features as they will be modified  
        
        //save the new image or load the old one
        if(ctx.request.files && ctx.request.files.file) {
            images = await getFile(ctx)
            //convert features from string to array
            features = features.split(',');
        } 
        else { 
            //check if image name exists
            if(ctx.request.body.image) {
                try{
                    const img = ctx.request.body.image;
                    loadFile(img); //try to load the file 
                    images = img; //set the image name 
                } catch (err) { throw new Error("This file does not exist!")}
            }         
        };
        const id = ctx.params.id; //preoprty id        
        
        //Set up the owner/seller of the property
        const author = {
            id: ctx.state.user._id,
            username: ctx.state.user.username
        }  
                
        //Add the information to the property
        const newProperty = {
            name: name,
            price: price,    
            image: images,
            description: description ,
            category: category,
            status: status,
            features: features,
            location: location ,
            author: author           
        }
        
        //find the property in the db and update it
        await Property.findByIdAndUpdate(id, newProperty, (err, property) => {
            if(err || !property){
                console.log(err);
                throw new Error("Fail!");
            } else {
                ctx.status = 200;    
                ctx.body = property;
                console.log("Property updated!");
            }
        });
    } catch(err) {
        console.log(err);
        //if the owner is different throw error
        throw new Error("Something went wrong with the update!");
    } 
}

/**
 * The function will delete a property.
 *
 * @name Delete property
 * @params {Object} ctx - context
 */
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
	const objImg = {filename: fileName, img:null}
    
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

//=================//
//MESSAGES
//=================//

/**
 * The function to get a message history and store it.
 *
 * @name Save message
 * @params {Object} ctx - context
 */
export async function addMessage(ctx) {
    //store all values from the body into variables
    const { receiver , msg } = ctx.request.body;       
    //get currently loged user
    let currentUser;
    if(ctx.state.user) {
        currentUser = ctx.state.user.username;
    } else {
        currentUser = "guest";
    }
    //set up a rule for searching
    const query = { sender: currentUser, receiver: receiver };
    try {
        //try to get an existing message history with the same sender-receiver
        let history = await History.find(query);
        //checks if the message history already exists
        if(history.length === 0) {
            history = new History();
            //Add the information of the new history
            history.sender = currentUser;
            history.receiver = receiver;     
            history.msgs.push(msg);
            //add new history
            await history.save().then(() => {
                        ctx.body = history;
                        console.log("New message history saved!");
                    }).catch(err => ctx.body = err);
        } else {
            history[0].msgs.push(msg)
            //find and update the history
            await History.findOneAndUpdate(query, history[0], (err, history) => {
                if(err || !history){
                    console.log(err);
                    throw new Error("Fail!");
                } else {
                    ctx.status = 200;    
                    ctx.body = history;
                    console.log("New message added!");
                }
            });
        }        
    } catch(err) {
        console.log(err);
        throw new Error("Fail to add history!");
    }     
}

/**
 * The function to get a all message history.
 *
 * @name Get messages
 * @params {Object} ctx - context
 */
export async function getHistory(ctx) {
    //get currently loged user
    const currentUser = ctx.state.user.username;
    
    try {        
        //get user message history from the DB
        const history = await History.find({ receiver: currentUser }, (err, history) => {
            if(err){
                console.log("No history to show");
                console.log(err);
            } else {                                        
                console.log(history)
                //set the body which will be send to the frontend
                ctx.body = history;         
            }
        }); 
    } catch(err) {
        console.log(err);
    } 
}

/**
 * The function will delete a message.
 *
 * @name Delete message
 * @params {Object} ctx - context
 */
export async function deleteMessage(ctx) {
    //get the property id from the request
    const id = ctx.params.id;
    //Find the property using the ID and remove it from the DB
    await History.findByIdAndRemove(id, (err) => {
        if(err){
            console.log("This message can't be deleted");
            console.log(err);
        } else {
            console.log("Message is deleted!")
            ctx.status = 200;       
        }
    });    
}
