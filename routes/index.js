//import combine lib and all API routes
import combineRouters from 'koa-combine-routers'
import profileRouter from './api/profiles.js'

//Combine all routes
const router = combineRouters(
  profileRouter
)

//Export all routes
export default router