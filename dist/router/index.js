"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let router = express.Router();
module.exports = function (app) {
    router.get("/", (req, res) => {
        res.send('YSJ Express3 - Test Push Finished2');
    });
    return router;
};
