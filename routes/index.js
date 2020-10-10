//import router and all API routes
import Router from '@koa/router';
import profileRouter from './api/profiles.js'

const finalRouter = new Router();

const nestedRoutes = [profileRouter];

//Store all routes in the final router
for (const router of nestedRoutes) {
	finalRouter.use(router.routes());
	finalRouter.use(router.allowedMethods());
}

//Export all routes
export default finalRouter;