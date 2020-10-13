import compose        from 'koa-compose';
import convert        from 'koa-convert';
import logger         from 'koa-logger';
import cors           from 'koa-cors';
import bodyParser     from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';

//Compose default middlewares
export default function middleware() {
    return compose([
        //Log all requests to the console
        logger(),
        //Cors allows or restricts requested resources on the web server
        convert(cors()),
        //Bodyparser used to read from the body
        convert(bodyParser()),
        //Koa method override tells the app to look for the _method query parameter in the URL 
        //and to use the method specified
        convert(methodOverride('_method'))
    ]);
}