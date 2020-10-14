/**
* @description JS file which runs the server and shows OpenApi and JSDoc.
* @author Mitko Donchev
*/
import Koa    from 'koa'; 
import serve  from 'koa-static';
import mount  from 'koa-mount';
import logger from 'koa-logger';

const app = new Koa();

app.use(logger());
app.use(mount('/', serve('./docs/jsdocs'))) // serve JSDocs
app.use(mount('/openapi', serve('./docs/openapi'))) // serve OpenAPI docsl
app.use(mount('/schemas', serve('./models'))); // serve schemas

let port = process.env.PORT || 3000;

app.listen(port, () => console.log('Web Server UP!'));