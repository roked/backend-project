//INDEX route

import Router   from 'koa-router';
import User     from '../models/user.js';

const router = Router({prefix: '/'});

//index route
router.get('/', async (ctx) => {
   try {
       await ctx.render('index');
   } catch (err){
       console.log(err.message);
   }
});


//Export the route so it is public(accessible)
export { router as indexRouter};