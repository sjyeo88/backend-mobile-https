//Core Modules
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import * as logger from "morgan";
import cors = require('cors')

//Model Modules
import * as mysql from "mysql";
import * as MySQLStore from "express-mysql-session"

//Auth Modules
import * as session from "express-session"
import * as passport from "passport"
import StrategyConfig = require("./auth-strategy")
import { ServerConfig, setInputInterface } from "./configure/config"

"use strict";



export class Server {

  public app;
  public conn;
  public sqlStore;
  public setInput;
  public auth;
  public strategy;
  public configure = new ServerConfig()
  //private hasher:pbkdf2Password = new pbkdf2Password();

  public static bootstrap() {
    return new Server();
  }



  constructor() {
    //app start
    console.log('Server Started!');
    this.setInput = this.configure.dbSetting;
    this.sqlStore = new MySQLStore(this.setInput);
    this.conn = mysql.createConnection(this.setInput);
    this.conn.connect(function(err){
      if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
      } else {
        console.log("DATABASE Connected");
      }
    });


    this.app  = express();
    //configure application
    this.config();

    //add routes
    this.routes();

    //External Modules
    //add config of auth-strategy
    this.strategy = new StrategyConfig.AuthStrategy(this);
  }

  public api():void {
    //empty for now
  }

  public config = function():void {
    this.app.use(express.static(path.join(__dirname, "public")));

    //use logger middlware
    this.app.use(logger("dev"));


    //use json form parser middlware
    this.app.use(bodyParser.json());

    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));


    //use cookie parker middleware middlware
    this.app.use(cookieParser(this.setInput.password));
    this.app.use(session({
        secret:this.setInput.password,
        resave: false,
        saveUninitialized: true,
        store: this.sqlStore
    }));

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    //use override middlware
    //this.app.use(methodOverride());

    //catch 404 and forward to error handler
    this.app.use((err: any, req: express.Request,
                  res: express.Response,
                  next: express.NextFunction) =>
    {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
    this.app.use(cors());
  }

  public routes = function():void {
    let auth = require("./router/auth")(this);
    let index = require("./router/index")(this);
    this.app.use('/auth', auth);
    this.app.use('/', index);
  }

}
