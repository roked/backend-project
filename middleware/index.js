/**
 * @module middleware/index
 * @description A module to add all npm middlewares to the app
 * @author Mitko Donchev
 */
import compose from 'koa-compose';
import convert from 'koa-convert';
import logger from 'koa-logger';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';

// Compose default middlewares
/**
 * A function to add all npm middlewares at once
 *
 * @name middleware
 */
export default function middleware() {
  return compose([
    // Log all requests to the console
    logger(),
    // Cors allows or restricts requested resources on the web server
    convert(cors()),
    // Bodyparser used to read from the body
    convert(bodyParser({ strict: false })),
  ]);
}
