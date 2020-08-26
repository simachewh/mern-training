const express = require('express');
const {
    check,
    validationResult
} = require('express-validator');
const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const router = express.Router();

// @rooute  Post api/posts
// @desc    Create posts
// @acess   Private
router.post('/', auth, [
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        console.error()
        res.status(400).json({
            errors: validationErrors.array()
        })
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

// @rooute  GET api/posts
// @desc    Get all posts
// @acess   Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        res.send(posts);
    } catch (error) {
        console.error(error.message);
        res.send('server error');
    }
});

// @rooute  GET api/posts/:post_id
// @desc    Get a post by id
// @acess   Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({
                message: 'post not found'
            });
        }
        res.send(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                message: 'post not found'
            });
        }
        res.send('server error');
    }
});

// @rooute  DELETE api/posts/:post_id
// @desc    Delete a post by id
// @acess   Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        // post doesn't exist
        if (!post) {
            return res.status(404).json({
                message: 'post not found'
            });
        }
        //check if user owns the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: 'user not authorised'
            });
        } else {
            await post.remove();
            res.json({
                message: 'post removed'
            })
        }
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                message: 'post not found'
            });
        }
        res.send('server error');
    }
});

module.exports = router;