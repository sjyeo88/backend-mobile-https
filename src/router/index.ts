import * as express from "express";
let router = express.Router();

/* GET home page. */
module.exports = function(app):express.Router{
  router.get("/", (req:express.Request, res:express.Response) => {
    res.send('YSJ Express3 - Test Push Finished2');
  });
  return router
}
