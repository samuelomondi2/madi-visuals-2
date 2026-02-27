const express = require('express');
const controller = require("../controller/hero.controller");

const router = express.Router();

router.post('/hero', controller.hero);
router.get('/hero', controller.getHero);
router.put('/hero', controller.updateHero);

module.exports = router;