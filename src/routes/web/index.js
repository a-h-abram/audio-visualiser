const express = require("express");
const router = express.Router();
const Controller = require('../../controllers/Controller');

router.get("/", (req, res) => { Controller.index(req, res); });

module.exports = router;