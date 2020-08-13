const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');

// @rooute  api/profile/me
// @desc    Get current user's profile
// @acess   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avator']);
        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @rooute  api/profile/me
// @desc    Post create or update user profile
// @acess   Private
router.post('/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({
                errors: validationErrors.array()
            })
        }
        const {
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;

        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            });
            if (profile) {
                // update profile
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });
                return res.json(profile);
            }
            // create profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).json('Server erros');
        }

        console.log('skills: ', profileFields.skills);
    })

// @rooute  GET api/profile
// @desc    Get all profiles
// @acess   Pubic
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avator']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server error');
    }
});

// @rooute  GET api/profile/user/:user_id
// @desc    Get profile by user id
// @acess   Pubic
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avator']);
        if (!profile) return res.status(400).json('Profile not found');
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json('Profile not found');
        }
        res.status(500).json('Server error');
    }
});


// @rooute  DELETE api/profile
// @desc    Delete a profile
// @acess   Private
router.delete('/', auth, async (req, res) => {
    try {
        // TODO : remove user's posts
        // Remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        // remove user
        await User.findOneAndRemove({
            _id: req.user.id
        })
        res.json('user id deleted');
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server error');
    }
});

// @rooute  PUT api/profile/experience
// @desc    Add experiences on profile
// @acess   Private
router.put('/experience', [auth,
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            title,
            company,
            from,
            to,
            location,
            current,
            description
        } = req.body;
        console.log('body: ', req.body);

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({
                user: req.user.id
            });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).json('server error');
        }
    })

// @rooute  PUT api/profile/experience/experience_id
// @desc    Delete experiences from profile
// @acess   Private
router.delete('/experience/:experience_id',
    auth,
    async (req, res) => {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        const profileIndex = profile.experience.map(item => item.id).indexOf(req
            .params.experience_id);
        console.log('exp_id', req.params.experience_id);

        profile.experience.splice(profileIndex, 1);
        profile.save();
        res.json(profile);
    })

module.exports = router;