"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const pbkdf2Password = require("pbkdf2-password");
const moment = require("moment");
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
        app.conn.query(sql, ['local:' + mail], function (err, results) {
            let user = results[0];
            console.log(user);
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
    return router;
};
