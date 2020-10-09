//Profile routes
import Router       from '@koa/router';
import User         from '../../models/user.js';
import passport     from 'passport';

//Init new router
const router = new Router({
  prefix: '/api'
});

router.get('/', async (ctx) => {
   try {
       await ctx.render('index');
   } catch (err){
       console.log(err.message);
   }
});

//Login route
router.post('/login', async (ctx) => {    
    //Perform authentication by using the LocalStrategy stored in passport.js
    //Passport auth with authenticate()   
    passport.authenticate('local', (err, user, info) => {
        // pass errors to error handler middleware
        if(err) { return console.log("Oh-no an error: " + err) }

        // if auth successful, assign their token value to a generated jwt
        // then return user object
        if(user) {
            user.token = user.generateJWT()
            return ctx.json({ user: user.toAuthJSON() })
        } else {
            return ctx.throw(422, 'Error')
        }
    })

});

//Register root
router.post('/register', async (ctx) => {
    //getting username from the body (form)
    try{
        let newUser = new User();    
        
        newUser.username = ctx.request.body.username;
        newUser.email = ctx.request.body.email;
        newUser.setPassword(ctx.request.body.password);
        
        console.log(newUser);
        
        await newUser.save().then((user) => {
               console.log('New user: ' + user);
            }).catch(err => {
               console.log("Error: ", err.message); 
            })     
    } catch (err) {
      console.log(err.message);
      ctx.redirect('/');
    }
});

//Export the route so it is public(accessible)
export default router;