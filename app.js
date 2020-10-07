//Import npm libraries etc.
import Koa             from 'koa'; 
import Router          from 'koa-router'; 
import views           from 'koa-views';
import mongoose        from 'mongoose';
import bodyParser      from 'koa-bodyparser';

const app = new Koa();

//Add BodyParser to app
app.use(bodyParser());

//Install the "handlebars" package
app.use(views(`views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}));

//Adding routes
app.use(indexRouter.routes());

//Import routes
import { indexRouter } from './routes/index.js';

//Storing port, url, and dbanme as environment variables
let port          = process.env.PORT   || 3000;
let connectUri    = process.env.URL    || 'mongodb://localhost:27017/back_end';

app.listen(port, () => console.log('Web Server UP!'));
