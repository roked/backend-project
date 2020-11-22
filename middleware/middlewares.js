/**
 * @module Route Methods and Middlewares
 * @description A module which contains all methods and middlewares used during CRUD operations
 * @author Mitko Donchev
 */
import User from '../models/user.js';
import Property from '../models/property.js';
import History from '../models/msghisotry.js';
import fs from 'fs-extra';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';

//Get the sign-up code from the config
import {signUpCode as secret} from '../routes/config.js';

//================//
//====ACCOUNTS====//
//================//

/**
 * An async function for handling registration.
 *
 * @name User registration
 * @params {Object} ctx - context
 */
export async function register(ctx) {
    //Store all values from the body into variables
    const {username, email, password, signUpCode} = ctx.request.body;
    try {
        //User validation
        if (username && email && password && signUpCode) {
            //Check if the sign up code is valid
            if (signUpCode !== secret.secret) {
                console.log('The sign-up code is wrong or not completed, please try again!');
                ctx.status = 400;
                ctx.body = {
                    message: 'The sign-up code is wrong or not completed, please try again!'
                };
            } else {
                let user = await User.findOne({email});
                let user1 = await User.findOne({username});
                //If the user is not registered
                if (!user && !user1) {
                    user = new User();
                    //Generate a random 64 bit string
                    const verification_token = randomstring.generate({length: 64});
                    //The permalink is the username but formated
                    const permalink = username.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();
                    //Add the information of the new user
                    user.username = username;
                    user.email = email;
                    //Password is hashed and securely stored
                    user.hashPassword(password);
                    user.permalink = permalink;
                    user.verify_token = verification_token;
                    user.verified = false; //User is not verified for now

                    await user.save((err) => { //Dave the user
                        if (err) { //if error
                            throw err;
                        } else {
                            //create a message - the verification link
                            const message = `https://program-nissan-3000.codio-box.uk/api/verify/${permalink}/${verification_token}`;
                            const result = sendEmail(username, email, message); //send an email
                            if (result) {
                                console.log("User registered!"); //The user is now registered
                                ctx.status = 200;
                                ctx.body = {
                                    message: 'User registered!'
                                };
                            } else {
                                console.log("Error!");
                                ctx.status = 400;
                                ctx.body = {
                                    message: 'Error during the registration. Please try again!'
                                };
                            }
                        }
                    });
                } else {
                    console.log('E-mail/username already registered!');
                    ctx.response.status = 400;
                    ctx.response.body = {
                        message: 'E-mail/username already registered!'
                    };
                }
            }
        } else {
            console.log('Email, username or password field is empty!');
            ctx.response.status = 400;
            ctx.response.body = {
                message: 'Email, username or password field is empty!'
            };
        }
    } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = {
            message: 'Error during the registration. Please try again!'
        };
    }
}

/**
 * A function for sending verification emails.
 *
 * @name Email sender
 * @params {String} username - the username of the user
 * @params {String} receiver - the email of the user
 * @params {String} message - the verification link
 */
function sendEmail(username, receiver, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'roked122@gmail.com',
            pass: 'emtjvksoxrovuaqo'
        }
    });

    const mailOptions = {
        from: 'register@confirmation.ac.uk',
        to: receiver,
        subject: 'Please verify you registration',
        text: `Thank you for the registration, ${username}! Please click the link to verify your account: ` + message
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

/**
 * An async function for verify user's email.
 *
 * @name Verify user
 * @params {Object} ctx - context
 */
export async function verifyUser(ctx) {
    const {permalink, token} = ctx.params;
    await User.findOne({permalink: permalink}, (err, user) => {
        if (user.verify_token === token) {
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

//================//
//===PROPERTIES===//
//================//

/**
 * An async function for handling property creation.
 *
 * @name Create property
 * @params {Object} ctx - context
 */
export async function create(ctx) {
    const {    //Store all values from the body into variables
        name, price, description, category, status,
        location
    } = ctx.request.body;
    //Get the features separately
    let {features} = ctx.request.body;
    //Get all files
    const images = await getFile(ctx);
    //Convert features from string to array
    features = features.split(',');
    let finalFeatures = [];
    for (const feat of features) {
        if (feat === 'true') {
            finalFeatures.push(true)
        } else {
            finalFeatures.push(false)
        }
    }
    //Set up the owner/seller of the property
    const author = {
        id: ctx.state.user._id,
        username: ctx.state.user.username
    }
    //Try to get an existing property with the same name/title
    let property = await Property.findOne({name});

    //if the property already exists
    if (!property) {
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

        //Save the new property
        await property.save().then(() => {
            ctx.status = 200;
            ctx.body = {
                message: 'New property successfully saved!'
            };
        }).catch(err => {
            console.log(err);
            ctx.status = 400;
            ctx.body = {
                message: 'Property not saved!'
            };
        });
    } else {
        console.log("Property name already in use!")
        ctx.status = 400;
        ctx.body = {
            message: 'Property name already registered!'
        };
    }
}

/**
 * An async function for retrieving all properties.
 *
 * @name Get all properties
 * @params {Object} ctx - context
 */
export async function display(ctx) {
    //set the default query
    let query = {status: {$ne: "Unpublished"}};
    //set the query if the user (if one)
    if (ctx.request.body.user && ctx.state.user._id) {
        const user = ctx.state.user;
        parseInt(user._id);
        query = {author: {id: user._id, username: user.username}};
    }
    try {
        //get all properties from the DB
        await Property.find(query, (err, property) => {
            if (property.length === 0) {
                ctx.status = 400;
                ctx.body = {
                    properties: [],
                    message: 'No properties to show!'
                };
            } else {
                //attach the image to the property object
                for (const prop of property) {
                    //get the image in base64 format
                    //and save it in the object
                    prop.image = loadFile(prop.image[0]);
                }
                console.log(property);
                //set the body which will be send to the frontend
                ctx.status = 200;
                ctx.body = {
                    properties: property,
                    message: 'All properties loaded!'
                };
            }
        });
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'Something went wrong on requesting all properties!'
        };
    }
}

/**
 * An async function for retrieving info about specific property.
 *
 * @name Get single property
 * @params {Object} ctx - context
 */
export async function displayOne(ctx) {
    try {
        //Get the property id from the request
        const id = ctx.params.id;
        //check if property exist
        await Property.findById(id, (err, property) => {
            if (err || !property) {
                console.log(err);
                ctx.status = 400;
                ctx.body = {
                    message: 'This property has no info or does not exist!'
                };
            } else {
                //get the image in base64 format
                //and save it in the object
                property.image = loadFile(property.image[0]);
                //set the body which will be send to the frontend
                //set the body which will be send to the frontend
                ctx.status = 200;
                ctx.body = {
                    property: property,
                    message: 'Property loaded!'
                };
            }
        });
    } catch (err) {
        ctx.status = 400;
        ctx.body = {
            message: 'Something went wrong on requesting the property!'
        };
    }
}

/**
 * An async function that allows the user to edit a property.
 *
 * @name Edit property
 * @params {Object} ctx - context
 */
export async function edit(ctx) {
    try {
        //Get the property id from the request
        const id = ctx.params.id;
        //check if the property exists
        await Property.findById(id, (err, property) => {
            if (err || !property) {
                console.log(err)
                ctx.status = 400;
                ctx.body = {
                    property: [],
                    message: 'This property has no info or does not exist!'
                };
            } else {
                //set the body which will be send to the frontend
                ctx.status = 200;
                ctx.body = {
                    property: property,
                    message: 'Property loaded!'
                };
            }
        });
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'This property cannot be edited!'
        };
    }
}

/**
 * An async function for updating the info of a property.
 *
 * @name Update property info
 * @params {Object} ctx - context
 */
export async function update(ctx) {
    try {
        let images; //property image
        //Store all values from the body into variables
        const {
            name, price, description, category, status,
            location
        } = ctx.request.body;
        let {features} = ctx.request.body;  //get features as they will be modified

        //save the new image or load the old one
        if (ctx.request.files && ctx.request.files.file) {
            images = await getFile(ctx)
        } else {
            //check if image name exists
            if (ctx.request.body.image) {
                try {
                    const img = ctx.request.body.image;
                    loadFile(img); //try to load the file
                    images = img; //set the image name
                } catch (err) {
                    console.log(err);
                    ctx.status = 400;
                    ctx.body = {
                        message: 'This file does not exist!'
                    };
                }
            }
        }
        const id = ctx.params.id; //property id
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
            description: description,
            category: category,
            status: status,
            features: features,
            location: location,
            author: author
        }
        //find the property in the db and update it
        await Property.findByIdAndUpdate(id, newProperty, (err, property) => {
            if (err || !property) {
                console.log(err)
                ctx.status = 400;
                ctx.body = {
                    message: 'This property has no info or does not exist!'
                };
            } else {
                ctx.status = 200;
                ctx.body = {
                    message: 'Property updated!'
                };
            }
        });
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'Something went wrong with the update!'
        };
    }
}
/**
 * An async function to check if the user is the owner of the property.
 *
 * @name Check owner of the property
 * @params {Object} ctx - context
 * @params {Object} next - context
 */
export async function isOwner(ctx, next) {
    try {
        //get the property id from the request and
        //also the user logged in this session
        const id = ctx.params.id;
        await Property.findById(id, (err, property) => {
            if (err || !property) {
                console.log(err)
                ctx.status = 400;
                ctx.body = {
                    message: 'This property has no info or does not exist!'
                };
            } else {
                if (property.author.id.equals(ctx.state.user._id)) {
                    next();
                } else {
                    //if the owner is different throw error
                    ctx.status = 400;
                    ctx.body = {
                        message: 'This user is not the owner of the property!'
                    };
                }
            }
        });
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'Something went wring during owner verification!'
        };
    }
}

/**
 * An async function that allows the user to delete a property.
 *
 * @name Delete property
 * @params {Object} ctx - context
 */
export async function deleteProperty(ctx) {
    //get the property id from the request
    const id = ctx.params.id;
    //Find the property using the ID and remove it from the DB
    await Property.findByIdAndRemove(id, (err) => {
        if (err) {
            console.log(err);
            ctx.status = 400;
            ctx.body = {
                message: 'This property cannot be removed!'
            };
        } else {
            ctx.status = 200;
            ctx.body = {
                message: 'Property deleted successfully!'
            };
        }
    });
}

/**
 * An async function to get a file from the frontend and store it.
 *
 * @name Save file
 * @params {Object} ctx - context
 * @returns {String} the name of the file which will be stored and used as reference
 */
async function getFile(ctx) {
    const images = ctx.request.files.file;
    const names = [];
    if (!images || images.length === 0) {
        names.push('default.png');
        return names;
    }
    try {
        for (const image of images) {
            await fs.writeFile(`public/uploads/${image.originalname}`, image.buffer, (err) => {
                if (err) {
                    console.log(err);
                    ctx.status = 400;
                    ctx.body = {
                        message: 'This file cannot be saved!'
                    };
                }
                ctx.status = 200;
                ctx.body = {
                    message: 'The file has been saved!'
                };
            });
            names.push(image.originalname);
        }
        return names; //return the name of the image
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'Saving file filed!'
        };
    }
}

/**
 * A function used to retrieve an image from the server files and format it in base64 string.
 *
 * @name Format image
 * @params {String} fileName - the name of the image
 * @returns {String} objImg - the base64 string format of the image
 */
function loadFile(fileName) {
    //objImg will store the base64 string string
    const objImg = {filename: fileName, img: null}
    try {
        //read the file from the server dir
        let bitMap = fs.readFileSync(`public/uploads/${fileName}`, (err) => {
            if (err) console.log(err);
        });

        //convert image to base64 string
        objImg.img = new Buffer.from(bitMap).toString("base64");
        //return the image
        return objImg;
    } catch (err) {
        console.log(err.message);
    }
}

//=================//
//MESSAGES
//=================//

/**
 * An async function to get a message and save it in the user history.
 *
 * @name Save message
 * @params {Object} ctx - context
 */
export async function addMessage(ctx) {
    //store all values from the body into variables
    const {receiver, msg} = ctx.request.body;
    //get currently logged user
    let currentUser;
    if (ctx.state.user) {
        currentUser = ctx.state.user.username;
    } else {
        currentUser = "guest";
    }
    //set up a rule for searching
    const query = {sender: currentUser, receiver: receiver};
    try {
        //try to get an existing message history with the same sender-receiver
        let history = await History.find(query);
        //checks if the message history already exists
        if (history.length === 0) {
            history = new History();
            //Add the information of the new history
            history.sender = currentUser;
            history.receiver = receiver;
            history.msgs.push(msg);
            //add new history
            await history.save().then(() => {
                console.log("New message history saved!");
                ctx.status = 200;
                ctx.body = {
                    message: 'Message send!'
                };
            }).catch(err => {
                console.log(err);
                ctx.status = 400;
                ctx.body = {
                    message: 'This message cannot be saved!'
                };
            });
        } else {
            history[0].msgs.push(msg)
            //find and update the history
            await History.findOneAndUpdate(query, history[0], (err, history) => {
                if (err || !history) {
                    console.log(err);
                    ctx.status = 400;
                    ctx.body = {
                        message: 'This user message history does not exist!'
                    };
                } else {
                    ctx.status = 200;
                    ctx.body = {
                        message: 'Message send!'
                    };
                }
            });
        }
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'Fail to add history!'
        };
    }
}

/**
 * An async function to get user's message history.
 *
 * @name Get message history
 * @params {Object} ctx - context
 */
export async function getHistory(ctx) {
    //get currently logged user
    const currentUser = ctx.state.user.username;
    try {
        //get user message history from the DB
        await History.find({receiver: currentUser}, (err, history) => {
            if (history.length === 0) {
                ctx.status = 400;
                ctx.body = {
                    history: [],
                    message: 'Inbox is empty!'
                };
            } else {
                ctx.status = 200;
                //set the body which will be send to the frontend
                ctx.body = {
                    history: history,
                    message: 'Your message history!'
                };
            }
        });
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: 'Fail to get message history!'
        };
    }
}

/**
 * An async function to delete a message.
 *
 * @name Delete message
 * @params {Object} ctx - context
 */
export async function deleteMessage(ctx) {
    //get the property id from the request
    const id = ctx.params.id;
    //Find the property using the ID and remove it from the DB
    await History.findByIdAndRemove(id, (err) => {
        if (err) {
            console.log(err);
            ctx.status = 400;
            ctx.body = {
                message: 'This message cannot be deleted!'
            };
        } else {
            ctx.status = 200;
            ctx.body = {
                message: 'Message deleted!'
            };
        }
    });
}

//TODO - remove
//async middleware to clear the DB
export async function deleteAll(ctx, next) {
    //Delete everything from the DB on users and properties
    await User.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("User DB clear");
        }
    });

    await Property.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Property DB clear");
        }
    });

    //continue after middleware is done
    await next();
}
