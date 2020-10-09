import compose from 'koa-compose';
import convert from 'koa-convert';
import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';

//Compose default middlewares
export default function middleware() {
    return compose([
        //Log all requests to the console
        logger(),
        //Cors allows or restricts requested resources on the web server
        convert(cors()),
        //Bodyparser used to read from the body
        convert(bodyParser()),
    ]);
}