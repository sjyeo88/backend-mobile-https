"use strict";
exports.__esModule = true;
var passport = require("passport");
var pbkdf2Password = require("pbkdf2-password");
var moment = require("moment");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var NaverStrategy = require("passport-naver").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var hasher = pbkdf2Password();
var AuthStrategy = (function () {
    function AuthStrategy(app) {
        var _this = this;
        this.calcKoreanAge = function (birth) {
            var date = new Date();
            var year = date.getFullYear();
            var month = (date.getMonth() + 1);
            var day = date.getDate();
            var monthday = month * 100 + day;
            var birthNumList = birth.split('-').map(function (x) { return parseInt(x); });
            var birthYear = birthNumList[0];
            var birthMonth = birthNumList[1];
            var birthDay = birthNumList[2];
            var birthMonthday = birthMonth * 100 + birthDay;
            if (monthday - birthMonthday >= 0) {
                return year - birthYear;
            }
            else {
                return year - birthYear - 1;
            }
        };
        passport.serializeUser(function (user, done) {
            console.log('serializeUser', user);
            done(null, user.authId);
        });
        passport.deserializeUser(function (id, done) {
            console.log('deserializeUser', id);
            var sql = 'SELECT * FROM users WHERE authId=?';
            app.conn.query(sql, [id], function (err, results) {
                if (err) {
                    console.log(err);
                    done('There is no user.');
                }
                else {
                    done(null, results[0]);
                }
            });
        });
        passport.use(new LocalStrategy({
            usernameField: "email",
            passwordField: "password"
        }, function (email, password, done) {
            var mail = email;
            var pwd = password;
            var sql = 'SELECT * FROM users WHERE authId=?';
            app.conn.query(sql, ['local:' + mail], function (err, results) {
                if (err) {
                    return done('There is no user.');
                }
                var user = results[0];
                return hasher({ password: pwd, salt: user.salt }, function (err, pass, salt, hash) {
                    if (hash === user.password) {
                        console.log('LocalStrategy', user);
                        done(null, user);
                    }
                    else {
                        done(null, false);
                    }
                });
            });
        }));
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APPID,
            clientSecret: process.env.FACEBOOK_APPPW,
            callbackURL: '/auth/facebook/callback',
            //passReqToCallback: true,
            profileFields: ['id', 'gender', 'link',
                'displayName', 'birthday', 'email']
        }, function (accessToken, refreshToken, profile, done) {
            var authId = 'facebook:' + profile._json.id;
            var birth = new Date(profile._json.birthday)
                .toISOString().split('T')[0];
            if (profile._json.email) {
                var prof_email = profile._json.email;
            }
            else {
                var prof_email = undefined;
            }
            var sql = 'SELECT * FROM users WHERE authId=?';
            app.conn.query(sql, authId, function (err, results) {
                if (results.length > 0) {
                    done(null, results[0]);
                }
                else {
                    var nowday = moment().format('YYYY-MM-DD');
                    var newuser_1 = {
                        PK: undefined,
                        name: profile._json.name,
                        authId: authId,
                        email: profile._json.email,
                        password: undefined,
                        sex: profile._json.gender,
                        birth: birth,
                        age: _this.calcKoreanAge(birth),
                        //birth: profile._json.birthday,
                        salt: 'facebook',
                        date: nowday
                    };
                    var sql_1 = 'INSERT INTO users SET ?';
                    app.conn.query(sql_1, newuser_1, function (err, result) {
                        if (err) {
                            console.log(err);
                            done('Error');
                        }
                        else {
                            done(null, newuser_1);
                        }
                    });
                }
            });
        }));
        passport.use(new NaverStrategy({
            clientID: process.env.NAVER_APPID,
            clientSecret: process.env.NAVER_APPPW,
            callbackURL: '/auth/naver/callback',
            //passReqToCallback: true,
            profileFields: ['id', 'gender', 'link', 'displayName', 'birthday', 'email']
            //profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
        }, function (accessToken, refreshToken, profile, done) {
            var authId = 'naver:' + profile._json.id;
            if (profile._json.email) {
                var prof_email = profile._json.email;
            }
            else {
                var prof_email = undefined;
            }
            console.log(profile);
            var sql = 'SELECT * FROM users WHERE authId=?';
            app.conn.query(sql, authId, function (err, results) {
                if (results.length > 0) {
                    console.log(results);
                    done(null, results[0]);
                }
                else {
                    var nowday = moment().format('YYYY-MM-DD').split('T')[0];
                    var newuser_2 = {
                        PK: undefined,
                        name: profile._json.nickname,
                        authId: authId,
                        email: profile._json.email,
                        password: undefined,
                        sex: profile._json.gender,
                        birth: profile._json.birthday,
                        age: parseInt(profile._json.age.split('-')[0]),
                        //age:profile._json.age.split('-'),
                        //birth: profile._json.birthday,
                        salt: 'naver',
                        date: nowday
                    };
                    var sql_2 = 'INSERT INTO users SET ?';
                    console.log(newuser_2);
                    app.conn.query(sql_2, newuser_2, function (err, result) {
                        if (err) {
                            console.log(err);
                            done('Error');
                        }
                        else {
                            done(null, newuser_2);
                        }
                    });
                }
            });
        }));
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_APPID,
            clientSecret: process.env.GOOGLE_APPPW,
            callbackURL: 'http://localhost:8080/auth/google/callback'
        }, function (accessToken, refreshToken, profile, done) {
            console.log(profile);
            console.log('Accesse');
            console.log(accessToken);
            console.log('Refresh');
            console.log(refreshToken);
            var authId = 'google:' + profile._json.id;
            var sql = 'SELECT * FROM users WHERE authId=?';
            app.conn.query(sql, authId, function (err, results) {
                var prof_email;
                if (profile._json.emails[0].value) {
                    prof_email = profile._json.emails[0].value;
                }
                else {
                    prof_email = undefined;
                }
                //done(null,  profile)
                if (results.length > 0) {
                    done(null, results[0]);
                }
                else {
                    var nowday = moment().format('YYYY-MM-DD').split('T')[0];
                    var newuser_3 = {
                        PK: undefined,
                        name: profile._json.displayName,
                        authId: authId,
                        email: prof_email,
                        password: undefined,
                        sex: profile._json.gender,
                        birth: profile._json.birthday,
                        age: undefined,
                        //age:parseInt(profile._json.age.split('-')[0]),
                        //age:profile._json.age.split('-'),
                        //birth: profile._json.birthday,
                        salt: 'naver',
                        date: nowday
                    };
                    var sql_3 = 'INSERT INTO users SET ?';
                    console.log(newuser_3);
                    app.conn.query(sql_3, newuser_3, function (err, result) {
                        if (err) {
                            console.log(err);
                            done('Error');
                        }
                        else {
                            done(null, newuser_3);
                        }
                    });
                }
            });
        }));
    }
    return AuthStrategy;
}());
exports.AuthStrategy = AuthStrategy;
