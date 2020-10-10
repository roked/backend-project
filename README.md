# backendcode304cem

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
npx nodemon app.js
```

#Mandatory dependencies:

```javascript
    "@koa/router": "^9.4.0",
    "crypto": "^1.0.1",
    "handlebars": "^4.7.6",
    "jsonwebtoken": "^8.5.1",
    "koa": "^2.13.0",
    "koa-bodyparser": "^4.3.0",
    "koa-compose": "^4.1.0",
    "koa-convert": "^2.0.0",
    "koa-cors": "0.0.16",
    "koa-logger": "^3.2.1",
    "koa-passport": "^4.1.3",
    "koa-session": "^6.0.0",
    "koa-views": "^6.3.1",
    "mongodb": "^3.6.2",
    "mongoose": "^5.10.7",
    "nodemon": "^2.0.4",
    "passport": "^0.4.1",
    "passport-custom": "^1.1.1",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
```

Don't forget to check for 
```javascript
  "type": "module",
``` 
in order to use ES6
