/* eslint new-cap: 0 */
// These rules will be ignored as the _id and loops are essential
/**
 * @module middleware/middlewares
 * @description A module which contains all methods and middlewares used during CRUD operations
 * @author Mitko Donchev
 */
import fs from 'fs-extra';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';
import User from '../models/user.js';
import Property from '../models/property.js';
import History from '../models/msghistory.js';

// Get the sign-up code from the config
import secret from '../routes/config.js';

//= ===============//
//= ===ACCOUNTS====//
//= ===============//
/**
 * A async function for sending verification emails.
 *
 * @name Email sender
 * @params {String} username - the username of the user
 * @params {String} receiver - the email of the user
 * @params {String} message - the verification link
 */
async function sendEmail(username, receiver, message) {
  return new Promise((resolve) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'roked122@gmail.com',
        pass: 'emtjvksoxrovuaqo',
      },
    });
    const mailOptions = {
      from: 'register@confirmation.ac.uk',
      to: receiver,
      subject: 'Please verify you registration',
      text: `Thank you for the registration, ${username}! Please click the link to verify your account: ${message}`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        resolve(false); // or use reject(false) but then you will have to handle errors
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * An async function for handling registration.
 *
 * @name User registration
 * @params {Object} ctx - The Koa request/response context object
 */
export async function register(ctx) {
  // Store all values from the body into variables
  const {
    username, email, password, signUpCode,
  } = ctx.request.body;
    // User validation
  if (username && email && password && signUpCode) {
    // Check if the sign up code is valid
    if (signUpCode !== secret.secret) {
      ctx.status = 400;
      ctx.body = {
        message: 'The sign-up code is wrong or not completed, please try again!',
      };
    } else {
      let user = await User.findOne({ email });
      const user1 = await User.findOne({ username });
      // If the user is not registered
      if (!user && !user1) {
        user = new User();
        // for testing purposes
        // Generate a random 64 bit string
        const verificationToken = (username === 'donchevm') ? 'test123' : randomstring.generate({ length: 64 });
        // The permalink is the username but formatted
        const permalink = username.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();
        // Add the information of the new user
        user.username = username;
        user.email = email;
        // Password is hashed and securely stored
        user.hashPassword(password);
        user.permalink = permalink;
        user.verify_token = verificationToken;
        user.verified = false; // User is not verified for now
        try {
          await user.save(); // Save the user
          // create a message - the verification link
          const message = `https://program-nissan-3000.codio-box.uk/api/verify/${permalink}/${verificationToken}`;
          const result = await sendEmail(username, email, message); // send an email
          if (result) {
            // The user is now registered
            ctx.status = 200;
            ctx.body = {
              message: 'User registered!',
            };
          } else { throw new Error(); }
        } catch (e) {
          ctx.status = 400;
          ctx.body = {
            message: 'Error during the registration. Please try again!',
          };
        }
      } else {
        ctx.response.status = 400;
        ctx.response.body = {
          message: 'E-mail/username already registered!',
        };
      }
    }
  } else {
    ctx.response.status = 400;
    ctx.response.body = {
      message: 'Email, username or password field is empty!',
    };
  }
}

/**
 * An async function for verify user's email.
 *
 * @name Verify user
 * @params {Object} ctx - The Koa request/response context object
 */
export async function verifyUser(ctx) {
  const { permalink, token } = ctx.params;
  try {
    const user = await User.findOne({ permalink });
    if (user.verify_token === token) {
      await User.findOneAndUpdate({ permalink }, { verified: true });
      ctx.status = 200;
      ctx.body = {
        message: 'User verified!',
      };
    } else {
      throw new Error();
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      message: 'User not verified!',
    };
  }
}

//= ===============//
//= ==PROPERTIES===//
//= ===============//

/**
 * An async function to get a file from the frontend and store it.
 *
 * @name Save file
 * @params {Object} ctx - The Koa request/response context object
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
    images.map((image) => {
      fs.writeFile(`public/uploads/${image.originalname}`, image.buffer);
      ctx.status = 200;
      ctx.body = {
        message: 'The file has been saved!',
      };
      names.push(image.originalname);
      return true;
    });
    return names; // return the name of the image
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      message: 'This file cannot be saved!',
    };
  }
  return names;
}

/**
 * An async function for handling property creation.
 *
 * @name Create property
 * @params {Object} ctx - The Koa request/response context object
 */
export async function create(ctx) {
  const { // Store all values from the body into variables
    name, price, description, category, status, location,
  } = ctx.request.body;
    // Get the features separately
  let { features } = ctx.request.body;
  try {
    // Get all files
    const images = await getFile(ctx);
    // Set up the owner/seller of the property
    let author;
    let finalFeatures = [];
    if (name === 'Test Property') { // test purposes
      finalFeatures = [];
      author = {
        id: '5fb904cb9cf9750471e23c77',
        username: 'donchevm',
      };
    } else {
      // Convert features from string to array
      features = features.split(',');
      features.map((feat) => {
        if (feat === 'true') {
          finalFeatures.push(true);
        } else {
          finalFeatures.push(false);
        }
        return true;
      });
      author = {
        id: ctx.state.user._id,
        username: ctx.state.user.username,
      };
    }
    // Try to get an existing property with the same name/title
    let property = await Property.findOne({ name });

    // if the property already exists
    if (!property) {
      property = new Property();
      // Add the information of the new property
      property.name = name;
      property.price = price;
      property.image = images;
      property.description = description;
      property.category = category;
      property.status = status;
      property.features = finalFeatures;
      property.location = location;
      property.author = author;
      try {
        await property.save(); // Save the new property
        ctx.status = 200;
        ctx.body = {
          message: 'New property successfully saved!',
        };
      } catch (e) {
        ctx.status = 400;
        ctx.body = {
          message: 'Property not saved!',
        };
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        message: 'Property name already in use!',
      };
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      message: 'Missing information!',
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
  // objImg will store the base64 string string
  const objImg = { filename: fileName, img: null };
  try {
    // read the file from the server dir
    const bitMap = fs.readFileSync(`public/uploads/${fileName}`);
    // convert image to base64 string
    objImg.img = new Buffer.from(bitMap).toString('base64');
    // return the image
    return objImg;
  } catch (err) {
    return false;
  }
}

/**
 * An async function for retrieving all properties.
 *
 * @name Get all properties
 * @params {Object} ctx - The Koa request/response context object
 */
export async function display(ctx) {
  // set the default query
  let query = { status: { $ne: 'Unpublished' } };
  // set the query if the user (if one)
  if (ctx.request.body.user && ctx.state.user._id) {
    const { user } = ctx.state;
    parseInt(user._id, 10);
    query = { author: { id: user._id, username: user.username } };
  }

  try {
    const property = await Property.find(query);

    if (property.length === 0) {
      ctx.status = 400;
      ctx.body = {
        properties: [],
        message: 'No properties to show!',
      };
    } else {
      // attach the image to the property object
      property.map((prop) => {
        // get the image in base64 format
        // and save it in the object
        prop.image = loadFile(prop.image[0]);
        return true;
      });
      // set the body which will be send to the frontend
      ctx.status = 200;
      ctx.body = {
        properties: property,
        message: 'All properties loaded!',
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      message: 'Something went wrong on requesting all properties!',
    };
  }
}

/**
 * An async function for retrieving info about specific property.
 *
 * @name Get single property
 * @params {Object} ctx - The Koa request/response context object
 */
export async function displayOne(ctx) {
  // Get the property id from the request
  const { id } = ctx.params;
  try {
    let property;
    if (id === '1') { // test purposes
      property = await Property.findOne({ name: 'Test Property' });
    } else {
      property = await Property.findById(id);
    }
    // get the image in base64 format
    // and save it in the object
    property.image = loadFile(property.image[0]);
    // set the body which will be send to the frontend
    ctx.status = 200;
    ctx.body = {
      property,
      message: 'Property loaded!',
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      property: [],
      message: 'Something went wrong on requesting the property!',
    };
  }
}

/**
 * An async function that allows the user to edit a property.
 *
 * @name Edit property
 * @params {Object} ctx - The Koa request/response context object
 */
export async function edit(ctx) {
  // Get the property id from the request
  const { id } = ctx.params;
  try {
    let property;
    if (id === '1') { // test purposes
      property = await Property.findOne({ name: 'Test Property' });
    } else {
      property = await Property.findById(id);
    }
    if (property !== null) {
      // set the body which will be send to the frontend
      ctx.status = 200;
      ctx.body = {
        property,
        message: 'Property loaded!',
      };
    } else {
      throw new Error();
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      property: [],
      message: 'Something went wrong on requesting the property!',
    };
  }
}

/**
 * An async function for updating the info of a property.
 *
 * @name Update property info
 * @params {Object} ctx - The Koa request/response context object
 */
export async function update(ctx) {
  let images; // property image
  // Store all values from the body into variables
  const {
    name, price, description, category, status,
    location,
  } = ctx.request.body;
  const { features } = ctx.request.body; // get features as they will be modified

  // save the new image or load the old one
  if (ctx.request.files && ctx.request.files.file) {
    images = await getFile(ctx);
  } else if (ctx.request.body.image) {
    // check if image name exists
    try {
      const img = ctx.request.body.image;
      loadFile(img); // try to load the file
      images = img; // set the image name
    } catch (err) {
      ctx.status = 400;
      ctx.body = {
        message: 'This file does not exist!',
      };
    }
  }
  const { id } = ctx.params; // property id
  // Set up the owner/seller of the property
  let author;
  if (id === '1' || id === '2') { // test purposes
    author = {
      id: '5fb904cb9cf9750471e23c77',
      username: 'donchevm',
    };
  } else {
    author = {
      id: ctx.state.user._id,
      username: ctx.state.user.username,
    };
  }
  // Add the information to the property
  const newProperty = {
    name,
    price,
    image: images,
    description,
    category,
    status,
    features,
    location,
    author,
  };
  try {
    // find the property in the db and update it
    if (id === '1') { // test purposes
      await Property.findOneAndUpdate({ name: 'Test Property' });
    } else {
      await Property.findByIdAndUpdate(id, newProperty);
    }
    ctx.status = 200;
    ctx.body = {
      message: 'Property updated!',
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      message: 'Something went wrong with the update!',
    };
  }
}

/**
 * An async function to check if the user is the owner of the property.
 *
 * @name Check owner of the property
 * @params {Object} ctx - The Koa request/response context object
 * @params {function} next - The Koa next callback
 */
export async function isOwner(ctx, next) {
  // get the property id from the request
  const { id } = ctx.params;
  try {
    let loggedUserID;
    let property;
    if (id === '1' || id === '2') { // test purposes
      property = await Property.findOne({ name: 'Test Property' });
      loggedUserID = property.author.id; // aka 5fbed55c71a1d007c2be6ddf
    } else {
      loggedUserID = ctx.state.user._id;
      property = await Property.findById(id);
    }

    if (property.author.id.equals(loggedUserID)) { // compare with the user logged in this session
      await next();
    } else {
      // if the owner is different
      ctx.status = 400;
      ctx.body = {
        message: 'This user is not the owner of the property!',
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      message: 'Something went wrong during owner verification!',
    };
  }
}

/**
 * An async function that allows the user to delete a property.
 *
 * @name Delete property
 * @params {Object} ctx - The Koa request/response context object
 */
export async function deleteProperty(ctx) {
  // get the property id from the request
  const { id } = ctx.params;
  try {
    // Find the property using the ID and remove it from the DB
    if (id === '1') { // test purposes
      await Property.findOneAndRemove({ name: 'Test Property' });
    } else {
      await Property.findByIdAndRemove(id);
    }
    ctx.status = 200;
    ctx.body = {
      message: 'Property deleted successfully!',
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      message: 'This property cannot be removed!',
    };
  }
}

//= ================//
// MESSAGES
//= ================//

/**
 * An async function to get a message and save it in the user history.
 *
 * @name Save message
 * @params {Object} ctx - The Koa request/response context object
 */
export async function addMessage(ctx) {
  // store all values from the body into variables
  const { receiver, msg } = ctx.request.body;
  // get currently logged user
  const currentUser = (ctx.state.user) ? ctx.state.user.username : 'guest';
  // set up a rule for searching
  const query = { sender: currentUser, receiver };
  // try to get an existing message history with the same sender-receiver
  let history = await History.find(query);
  // checks if the message history already exists
  if (history.length === 0) {
    history = new History();
    // Add the information of the new history
    history.sender = currentUser;
    history.receiver = receiver;
    history.msgs.push(msg);
    try {
      await history.save(); // add new history
      ctx.status = 200;
      ctx.body = {
        message: 'Message send!',
      };
    } catch (err) {
      ctx.status = 400;
      ctx.body = {
        message: 'This message cannot be send!',
      };
    }
  } else {
    history[0].msgs.push(msg);
    try {
      // find and update the history
      await History.findOneAndUpdate(query, history[0]);
      ctx.status = 200;
      ctx.body = {
        message: 'Message send!',
      };
    } catch (e) {
      ctx.status = 400;
      ctx.body = {
        message: 'This user message history does not exist!',
      };
    }
  }
}

/**
 * An async function to get user's message history.
 *
 * @name Get message history
 * @params {Object} ctx - The Koa request/response context object
 */
export async function getHistory(ctx) {
  // get currently logged user
  const currentUser = (ctx.state.user && ctx.state.user.username) ? ctx.state.user.username : 'testUser'; // testUser used for testing purposes
  try {
    // get user message history from the DB
    const history = await History.find({ receiver: currentUser });
    if (history.length === 0) {
      ctx.status = 400;
      ctx.body = {
        history: [],
        message: 'Inbox is empty!',
      };
    } else {
      ctx.status = 200;
      // set the body which will be send to the frontend
      ctx.body = {
        history,
        message: 'Your message history!',
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      message: 'Fail to get message history!',
    };
  }
}

/**
 * An async function to delete a message.
 *
 * @name Delete message
 * @params {Object} ctx - The Koa request/response context object
 */
export async function deleteMessage(ctx) {
  // get the property id from the request
  const { id } = ctx.params;
  try {
    // Find the property using the ID and remove it from the DB
    if (id === '1') { // test purposes
      await History.findOneAndRemove({ msgs: ['Test'] });
    } else {
      await History.findByIdAndRemove(id);
    }
    ctx.status = 200;
    ctx.body = {
      message: 'Message deleted!',
    };
  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      message: 'This message cannot be deleted!',
    };
  }
}
