//Profile routes
import Router       from '@koa/router';
import User         from '../../models/user.js';
import { passport } from '../../config/passport.js';

//Init new router
const router = new Router();

//index route
router.get('/', async (ctx) => {
   try {
       await ctx.render('index');
   } catch (err){
       console.log(err.message);
   }
});

//register root
router.post('/', async (ctx) => {
    //getting username from the body (form)
    try{
        const newUser = {
            email: ctx.request.body.email,
            username: ctx.request.body.username,
            password: ctx.request.body.password
        }        
        await User.create(newUser, (err, user) => {
        if(err){
            console.log('Error: ' + err.message);
            ctx.redirect('/');
        } else {
            console.log('New user created: ' + user);
            ctx.redirect('/');
        }
      });
    } catch (err){
      console.log(err.message);
      ctx.redirect('/');
    }
});

//login root
// router.post('/', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/'
// }))


//Export the route so it is public(accessible)
export default router;