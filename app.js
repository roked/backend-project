//Import npm libraries etc.
import Koa             from 'koa'; 
import views           from 'koa-views';
import mongoose        from 'mongoose';
import bodyParser      from 'koa-bodyparser';
import session         from 'koa-session';
import middleware      from './middleware/index.js';
import auth            from './routes/auth.js';
import router          from './routes/index.js';

const app = new Koa();

//Koa sessions
app.keys = ['the-super-secret-key'];
app.use(session(app));

//Add middlewares
app.use(middleware());

//Add Authentication
app.use(auth());

//Install the "handlebars" package
app.use(views(`views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}));

// authentication
app.use(auth());

//use the routes from index.js
app.use(router.routes())
app.use(router.allowedMethods())

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
