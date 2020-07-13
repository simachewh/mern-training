const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator/check');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// @rooute      POST api/users
// @desc        Register user
// @acess       Public
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please include a password with 6 or more characters').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            name,
            email,
            password
        } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'User already exists'
                    }]
                });
            }

            // Get users gravatar
            const avatar = gravatar.url({
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            // return the jsonwebtoken

            res.send('User route')
        } catch (err) {
            console.log('ERROR:'.err.message);

        }

    });

module.exports = router;