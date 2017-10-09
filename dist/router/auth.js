"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const pbkdf2Password = require("pbkdf2-password");
const moment = require("moment");
const passport = require("passport");
const config_1 = require("../configure/config");
let LocalStrategy = require("passport-local");
let FaceboockStrategy = require("passport-facebook");
let jwt = require("jwt-simple");
let router = express.Router();
let hasher = pbkdf2Password();
module.exports = function (app) {
    let config = new config_1.ServerConfig();
    router.use(function timeLog(req, res, next) {
        console.log('Time', Date.now());
        next();
    });
    router.post("/local/register", (req, res) => {
        hasher({ password: req.body.password }, (err, pass, salt, hash) => {
            let user = {
                PK: undefined,
                authId: 'local:' + req.body.email,
                email: req.body.email,
                name: req.body.name,
                sex: undefined,
                birth: undefined,
                age: undefined,
                password: hash,
                salt: salt,
                date: moment().format('YYYY-MM-DD')
            };
            let insertUser_Q = 'INSERT INTO users SET ?';
            app.conn.query(insertUser_Q, user, (err, result) => {
                if (err) {
                    res.json({ success: false, msg: 'Failed to Save' });
                }
            });
        });
        res.json({ success: true, msg: 'Successfully saved' });
    });
    router.post('/local', (req, res, next) => {
        let mail = req.body.email;
        let pwd = req.body.password;
        let name = req.body.name;
        let sql = 'SELECT * FROM users WHERE authId=?';
        console.log(mail + "," + pwd);
        app.conn.query(sql, ['local:' + mail], function (err, results) {
            let user = results[0];
            if (!user) {
                return res.json({ success: false, msg: 'Authentiaion failed, Users not found' });
            }
            return hasher({ password: pwd, salt: user.salt }, function (err, pass, salt, hash) {
                if (hash === user.password) {
                    let token = jwt.encode(user, config.jwt_password);
                    res.json({ success: true, token: token, msg: 'Welcome ' + user.name });
                }
                else {
                    return res.json({ succuss: false, msg: 'Authenticaion fialed, Wrong password' });
                }
            });
        });
    });
    router.get("/logout", (req, res) => {
        req.logout();
        req.session.save(() => {
            res.send("local log-out");
        });
    });
    router.get("/fail", (req, res) => {
        res.send("Auth Fail");
    });
    router.get("/welcome", (req, res) => {
        if (req.user && req.user.name) {
            res.send('Welcome! ' + req.user.name + '!');
        }
        else {
            res.send('Welcome! Unknown!');
        }
    });
    router.get("/facebook", passport.authenticate('facebook', { scope: ['email', 'user_birthday'] }));
    router.get("/facebook/callback", passport.authenticate('facebook', {
        successRedirect: '/auth/welcome',
        failureRedirect: '/auth/fail'
    }));
    router.get("/naver", passport.authenticate('naver', { scope: ['email', 'user_birthday', 'name'] }));
    router.get("/naver/callback", passport.authenticate('naver', {
        successRedirect: '/auth/welcome',
        failureRedirect: '/auth/fail'
    }));
    router.get("/google", (req, res, next) => {
        passport.authenticate('google', { scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/plus.login',
                'https://www.googleapis.com/auth/plus.me',
            ]
        }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send({ success: false, message: 'authentication failed' });
            }
        })(req, res, next);
    });
    router.get("/google/callback", passport.authenticate('google', {
        successRedirect: '/auth/welcome',
        failureRedirect: '/auth/fail'
    }));
    return router;
};
