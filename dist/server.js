"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("errorhandler");
const logger = require("morgan");
const cors = require("cors");
const mysql = require("mysql");
const MySQLStore = require("express-mysql-session");
const session = require("express-session");
const passport = require("passport");
const StrategyConfig = require("./auth-strategy");
const config_1 = require("./configure/config");
"use strict";
class Server {
    constructor() {
        this.configure = new config_1.ServerConfig();
        this.config = function () {
            this.app.use(express.static(path.join(__dirname, "public")));
            this.app.use(logger("dev"));
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({
                extended: true
            }));
            this.app.use(cookieParser(this.setInput.password));
            this.app.use(session({
                secret: this.setInput.password,
                resave: false,
                saveUninitialized: true,
                store: this.sqlStore
            }));
            this.app.use(passport.initialize());
            this.app.use(passport.session());
            this.app.use((err, req, res, next) => {
                err.status = 404;
                next(err);
            });
            this.app.use(errorHandler());
            this.app.use(cors());
        };
        this.routes = function () {
            let auth = require("./router/auth")(this);
            let index = require("./router/index")(this);
            this.app.use('/auth', auth);
            this.app.use('/', index);
        };
        console.log('Server Started!');
        this.setInput = this.configure.dbSetting;
        this.sqlStore = new MySQLStore(this.setInput);
        this.conn = mysql.createConnection(this.setInput);
        this.conn.connect(function (err) {
            if (err) {
                console.error('mysql connection error');
                console.error(err);
                throw err;
            }
            else {
                console.log("DATABASE Connected");
            }
        });
        this.app = express();
        this.config();
        this.routes();
        this.strategy = new StrategyConfig.AuthStrategy(this);
    }
    static bootstrap() {
        return new Server();
    }
    api() {
    }
}
exports.Server = Server;
