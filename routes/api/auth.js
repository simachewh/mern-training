const express = require('express');
const router = express.Router();

// @rooute  api/auth
// @desc    test router
// @acess   Public
router.get('/', (req, res) => res.send('Auth  route'));

module.exports = router;