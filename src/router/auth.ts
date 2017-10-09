import * as express from "express";
import * as pbkdf2Password from "pbkdf2-password"
import * as moment from "moment"
import * as passport from "passport"
import * as session from "express-session"

import { ServerConfig, setInputInterface } from "../configure/config"
import { UserDATA } from "../interfaces/userdata.interface"

let LocalStrategy  = require("passport-local")
let FaceboockStrategy = require("passport-facebook")
let jwt = require("jwt-simple")

let router = express.Router();
let hasher:pbkdf2Password  = pbkdf2Password();





module.exports = function(app):express.Router{
//Need to adding type of 'app'
  let config = new ServerConfig();

  router.use(function timeLog(req:express.Request,
                     res:express.Response,
                     next:express.NextFunction):void
    {
      console.log('Time', Date.now());
      next();
    }
  );

  router.post(
    "/local/register",
    (req:express.Request, res:express.Response) => {
    //Register Users
    hasher({password:req.body.password},
           (err:string, pass:string, salt:string, hash:string) =>
              {
              let user:UserDATA = {
                PK:undefined,
                authId: 'local:' + req.body.email,
                email: req.body.email,
                name: req.body.name,
                sex:undefined,
                birth:undefined,
                age:undefined,
                password: hash,
                salt: salt,
                date:moment().format('YYYY-MM-DD')
              };

        let insertUser_Q:string = 'INSERT INTO users SET ?'
        app.conn.query(insertUser_Q, user, (err:string, result:object) =>
          {
            if(err){
              // console.log(err);
              // res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            }
          }
        )
      })

      res.json({success:true, msg:'Successfully saved'})
 });

  router.post('/local',
    (req:express.Request, res:express.Response, next:express.NextFunction) =>
    {
        let mail:string = req.body.email;
        let pwd:string = req.body.password;
        let name:string = req.body.name;
        let sql = 'SELECT * FROM users WHERE authId=?';
        // console.log(mail + "," + pwd)

        app.conn.query(sql, ['local:'+mail], function(err, results){
          let user:UserDATA = results[0];
          // console.log(user)

          if (!user) {
            return res.json(
              {success: false, msg: 'Authentiaion failed, Users not found'}
            )
          }

          return hasher({password:pwd, salt:user.salt},
            function(err, pass, salt, hash){
            if(hash === user.password){
              // console.log('LocalStrategy', user);
              let token = jwt.encode(user, config.jwt_password)
              res.json({success:true, token:token, msg: 'Welcome ' + user.name})
            } else {
              return res.json(
                {succuss:false, msg:'Authenticaion fialed, Wrong password'}
              )
            }
            }
          );
        });
      }
  );

// router.get("/logout", (req:express.Request, res:express.Response) => {
//   req.logout();
//   req.session.save(()=>{
//     res.send("local log-out")
//   })
// });
//
// router.get("/fail", (req:express.Request, res:express.Response) => {
//   res.send("Auth Fail")
// });
//
// router.get("/welcome", (req:express.Request, res:express.Response) => {
//   if(req.user && req.user.name){
//     res.send('Welcome! ' + req.user.name + '!');
//   } else {
//     res.send('Welcome! Unknown!');
//   }
// });

// router.get("/facebook",
//   passport.authenticate(
//     'facebook',
//     {scope: ['email', 'user_birthday']}
//   )
// );
//
// router.get("/facebook/callback",
//   passport.authenticate(
//     'facebook',
//     {
//       successRedirect:'/auth/welcome',
//       failureRedirect: '/auth/fail'
//     })
// );
//
// router.get("/naver",
//   passport.authenticate(
//     'naver',
//     {scope: ['email', 'user_birthday', 'name']}
//   )
// );
//
// router.get("/naver/callback",
//   passport.authenticate(
//     'naver',
//     {
//       successRedirect:'/auth/welcome',
//       failureRedirect: '/auth/fail'
//     })
// );
//
// router.get("/google", (req, res, next) => {
//   passport.authenticate(
//     'google',
//     {scope: [
//       'https://www.googleapis.com/auth/userinfo.email',
//       'https://www.googleapis.com/auth/userinfo.profile',
//       //'https://www.googleapis.com/auth/contacts.readonly',
//       'https://www.googleapis.com/auth/plus.login',
//       'https://www.googleapis.com/auth/plus.me',
//       // 'https://www.googleapis.com/auth/user.birthday.read',
//       //'https://www.googleapis.com/auth/plus.login',
//     ]
//
//     },
//     (err, user, info) => {
//       if(err){return next(err)}
//       if (! user) {
//         return res.send({ success : false, message : 'authentication failed' });
//       }
//     }
//   )(req, res, next);
//   }
// );
//
// router.get("/google/callback",
//   passport.authenticate(
//     'google',
//     {
//       successRedirect:'/auth/welcome',
//       failureRedirect: '/auth/fail'
//     })
// );
/*
router.post("/facebook", function(req, res){
  res.send("facebook register")
});
router.delete("/facebook", function(req, res){
  res.send("facebook log-out")
});

router.get("/facebook", function(req, res){
  res.send("facebook login")
});
router.post("/facebook", function(req, res){
  res.send("facebook register")
});
router.delete("/facebook", function(req, res){
  res.send("facebook log-out")
});
*/
  return router;
};
