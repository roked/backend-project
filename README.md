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
npx nodemon app.js
```

# Mandatory dependencies:

You must run:
```javascript
npm i -s @koa/router crypto ejs koa koa-bodyparser koa-compose koa-convert koa-cors koa-logger koa-passport koa-session koa-views mongodb mongoose passport passport-custom passport-local koa-methodoverride
```

```javascript
    "@koa/router": "^9.4.0",
    "crypto": "^1.0.1",
    "ejs": "^4.7.6",
    "koa": "^2.13.0",
    "koa-bodyparser": "^4.3.0",
    "koa-compose": "^4.1.0",
    "koa-convert": "^2.0.0",
    "koa-cors": "0.0.16",
    "koa-logger": "^3.2.1",
    "koa-methodoverride": "^2.0.0",
    "koa-passport": "^4.1.3",
    "koa-session": "^6.0.0",
    "koa-views": "^6.3.1",
    "mongodb": "^3.6.2",
    "mongoose": "^5.10.7",
    "nodemon": "^2.0.4",
    "passport": "^0.4.1",
    "passport-custom": "^1.1.1",
    "passport-local": "^1.0.0",
```

#### Node version during developement was v12.18.3.

### Don't forget to check for 
```javascript
  "type": "module",
``` 
inside the package.json file in order to use ES6

# Features 

1. The website allows the user to see a list of properties listed for sale. 

2. For now the user can see more information about a single property.

3. After registration the user can create a new property and add description, price, location etc.

4. The user can edit or delete a property sold by them.

