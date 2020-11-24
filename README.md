# backendcode304cem

#### Single Page Application project with React for front end and NodeJS for backend. 

In order to start the DB run in the terminal 
```javascript
'mongod'
```

You can run the project by first cd in the right directory (backendcode304cem) and use 

```javascript
node app.js
```

or

```javascript
npm start
```

# Mandatory dependencies:

You must run:
```javascript
npm i
```

```javascript
"@koa/cors": "^3.1.0",
    "@koa/multer": "^3.0.0",
    "@koa/router": "^9.4.0",
    "crypto": "^1.0.1",
    "ejs": "^3.1.5",
    "fs-extra": "^9.0.1",
    "handlebars": "^4.7.6",
    "http": "0.0.1-security",
    "jsonwebtoken": "^8.5.1",
    "koa": "^2.13.0",
    "koa-bodyparser": "^4.3.0",
    "koa-compose": "^4.1.0",
    "koa-convert": "^2.0.0",
    "koa-cors": "0.0.16",
    "koa-logger": "^3.2.1",
    "koa-methodoverride": "^2.0.0",
    "koa-mount": "^4.0.0",
    "koa-passport": "^4.1.3",
    "koa-router": "^9.4.0",
    "koa-session": "^6.0.0",
    "koa-static": "^5.0.0",
    "koa-views": "^6.3.1",
    "moment": "^2.29.1",
    "mongodb": "^3.6.2",
    "mongoose": "^5.10.7",
    "mongoose-unique-validator": "^2.0.3",
    "multer": "^1.4.2",
    "nodemailer": "^6.4.16",
    "nodemon": "^2.0.4",
    "passport": "^0.4.1",
    "passport-custom": "^1.1.1",
    "passport-local": "^1.0.0",
    "randomstring": "^1.1.5",
```

#### Node version during developement is v12.18.3.

### Don't forget to check for 
```javascript
  "type": "module",
``` 
inside the package.json file in order to use ES6

# Available endpoints

 ##### User
 * POST {{serverUrl}}/api/user/login
 * POST {{serverUrl}}/api/user/register
 * GET  {{serverUrl}}/api/user/logout
 * GET  {{serverUrl}}/api/verify/:permalink/:token
 
 ##### Property
 * POST   {{serverUrl}}/api/property/new
 * POST   {{serverUrl}}/api/property/show
 * GET    {{serverUrl}}/api/property/:id
 * GET    {{serverUrl}}/api/property/show/:id/edit
 * PUT    {{serverUrl}}/api/property/show/:id
 * DELETE {{serverUrl}}/api/property/delete/:id

 ##### Messages
 * POST   {{serverUrl}}/api/message/new
 * GET    {{serverUrl}}/api/message/get
 * DELETE {{serverUrl}}/api/message/:id
# Features 

1. The website allows the user to see a list of properties listed for sale. 

2. Every user can see more information about a single property and send a private message to the owner.

3. After registration the user can create a new property and add description, price, location etc.

4. The user can edit, delete and archive a property sold by them.

5. Every user can apply filters on the home page to sort the properties.

6. A logged in user can access their profile page and check the properties they own and messages from other users/guest.

7. Filtering properties is also available under profile page.

# OpenAPI and JSDoc documentation is available

If you want to check the OpenAPI and JSDoc (with schemas) you have to run:

```javascript
   node docs.js
``` 

Two routes follow:

```javascript
   '/' and '/openapi'
``` 
