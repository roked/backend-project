//Seting up the authentication by checking the tokens
import jwt             from 'jsonwebtoken';
import config          from '../config/config.js';

//get the secret string used for JWT
const secret = config.secret;

//Function to help return the token from request header
export function getTokenFromHeader(ctx){
  if (ctx.request.headers.authorization && ctx.request.headers.authorization.split(' ')[0] === 'Token') {
    return ctx.request.authorization.split(' ')[1];
  }

  return null;
}

export let auth = {
  //jwt for endpoint with required auth
  required: jwt({
    secret: secret,
    //Define where the payload will be attached
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  //For optional auth
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

//Export the auth so it is public(accessible)
export{ getTokenFromHeader, auth};