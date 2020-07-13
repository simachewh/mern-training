const express = require('express');
const router = express.Router();

// @rooute  api/posts
// @desc    test router
// @acess   Public
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;