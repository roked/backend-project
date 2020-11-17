/**
* @description Main JS file which runs the server and combines all functionality.
* @author Mitko Donchev
*/
import Koa        from 'koa'; 
import views      from 'koa-views';
import mongoose   from 'mongoose';
import bodyParser from 'koa-bodyparser';
import session    from 'koa-session';
import passport   from 'koa-passport';
import serve      from 'koa-static';
import middleware from './middleware/index.js';
import auth       from './routes/auth.js';
import router     from './routes/index.js';
import cors       from '@koa/cors';
import moment     from 'moment';
import { Server } from 'socket.io';

const app = new Koa();

//Setting up cors
const options = {
  origin: true,
  credentials: true
};
app.use(cors(options));

//Config session
app.keys = ['my-secret-key'];
app.use(session(app));

// Init passport authentication 
app.use(passport.initialize());
// persistent login sessions 
app.use(passport.session());

//use the public folder
app.use(serve('public'));

//Install the "ejs" package (not using handlebar because it is LOGICLESS - no JS script)
app.use(views(`views`, { extension: 'ejs' }, {map: { ejs: 'ejs' }}));

//Add middlewares
app.use(middleware());

//Add Authentication
app.use(auth());

//use the routes from index.js
app.use(router.routes())
app.use(router.allowedMethods())

//TODO - store them in a seperate file
//Storing port, url, and dbanme as environment variables
let port          = process.env.PORT   || 3000;
let connectUri    = process.env.URL    || 'mongodb://localhost:27017/back_end';

/**
 * @param {String} URI
 */
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

//Start server on port 3000
app.listen(port, () => console.log('Web Server UP!'));

// const io = new Server(server)

//============//
// let users = [];
// io.on("connection", (socket) => {

//     socket.on("login", (userName) => {
//         users.push({ id: socket.id, userName: userName, connectionTime: new moment().format("YYYY-MM-DD HH:mm:ss") });
//         socket.emit("connecteduser", JSON.stringify(users[users.length - 1]));
//         io.emit("users", JSON.stringify(users));
//     });

//     socket.on("sendMsg", msgTo => {
//         msgTo = JSON.parse(msgTo);
//         const minutes = new Date().getMinutes();
//         io.emit("getMsg",
//             JSON.stringify({
//                 id: socket.id,
//                 userName: users.find(e => e.id === msgTo.id).userName,
//                 msg: msgTo.msg,
//                 time: new Date().getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes)
//             }));
//     });

//     socket.once("disconnect", () => {
//         let index = -1;
//         if (users.length >= 0) {
//             index = users.findIndex(e => e.id == socket.id);
//         }
//         if (index >= 0)
//             users.splice(index, 1);
//         io.emit("users", JSON.stringify(users));
//     });
// });
//=========//

//Export the app
export default app;
