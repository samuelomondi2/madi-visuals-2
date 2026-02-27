const express = require('express');
const controller = require("../controller/hero.controller");

const router = express.Router();

router.post('/hero', controller.hero);
router.get('/hero', controller.getHero);

module.exports = router;