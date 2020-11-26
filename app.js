/**
 * @description Main JS file which runs the server and combines all functionality.
 * @author Mitko Donchev
 */
import Koa from 'koa';
import session from 'koa-session';
import passport from 'koa-passport';
import serve from 'koa-static';
import cors from '@koa/cors';
import middleware from './middleware/index.js';
import auth from './routes/auth.js';
import router from './routes/index.js';

const app = new Koa();

// Setting up cors
const options = {
  origin: true,
  credentials: true,
};
app.use(cors(options));

// Config session
app.keys = ['my-secret-key'];
app.use(session(app));

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());

// use the public folder
app.use(serve('public'));

// Add middlewares
app.use(middleware());

// Add Authentication
app.use(auth());

// use the routes from index.js
app.use(router.routes());
app.use(router.allowedMethods());

// Export the app
export default app;
