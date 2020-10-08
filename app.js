//Import npm libraries etc.
import Koa             from 'koa'; 
import router          from './routes/index.js';
import views           from 'koa-views';
import mongoose        from 'mongoose';
import bodyParser      from 'koa-bodyparser';
import session         from 'koa-session';
import passport        from 'koa-passport';

const app = new Koa();

//Koa sessions
app.keys = ['the-super-secret-key'];
app.use(session(app));

//Add body parser in order to read from the website body
app.use(bodyParser());

//Install the "handlebars" package
app.use(views(`views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}));

// authentication
import './routes/auth.js';
app.use(passport.initialize());
app.use(passport.session());

//use the routes from index.js
app.use(router());

//Storing port, url, and dbanme as environment variables
let port          = process.env.PORT   || 3000;
let connectUri    = process.env.URL    || 'mongodb://localhost:27017/back_end';

//Connect to Mongoose
mongoose.connect(connectUri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
   console.log("Connected to DB!");  
}).catch(err => {
   console.log("Error: ", err.message); 
});

app.listen(port, () => console.log('Web Server UP!'));

export default app;
