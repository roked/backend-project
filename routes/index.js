/**javascript:void(0)
 * @module Router/index
 * @description Index route file which imports all routes and combines them.
 * @author Mitko Donchev
 */
import Router from '@koa/router';
import profileRouter from './api/profiles.js'
import propertyRouter from './api/properties.js'
import messagesRouter from './api/messages.js'

const finalRouter = new Router();

const nestedRoutes = [profileRouter, propertyRouter, messagesRouter];

//Store all routes in the final router
for (const router of nestedRoutes) {
    finalRouter.use(router.routes());
    finalRouter.use(router.allowedMethods());
}

//Export all routes
export default finalRouter;