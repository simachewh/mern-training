const express = require('express');
const router = express.Router();

// @rooute  api/profile
// @desc    test router
// @acess   Public
router.get('/', (req, res) => res.send('Profile route'));

module.exports = router;