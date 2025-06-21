const express = require('express');
const User = require('../modules/user');
const BlogPost = require('../modules/postmodule');
const Comment = require('../modules/commentmodule');
const Notification = require('../modules/notificationmodule');
const multer = require('multer');
const path = require('path');
const route = express.Router();
const isLogedIn = require('../utils/isLogeedIn');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

route.use(express.json());
route.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = 'public/uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

route.post('/post', isLogedIn, upload.single('media'), async (req, res) => {
    let { title, content } = req.body;
    const userId = req.user._id;
    const mediaFile = req.file;
    
    const postData = {
        title,
        content,
        users: [userId]
    };
    
    // Add media file if uploaded
    if (mediaFile) {
        postData.media = {
            filename: mediaFile.filename,
            path: `/uploads/${mediaFile.filename}`,
            type: mediaFile.mimetype.startsWith('image/') ? 'image' : 'video'
        };
    }
    
    try {
        const Posts = await BlogPost.create(postData);
        
        // Notify followers about new post
        const currentUser = await User.findById(userId);
        if (currentUser.followers && currentUser.followers.length > 0) {
            const notifications = currentUser.followers.map(followerId => ({
                recipient: followerId,
                sender: userId,
                type: 'post',
                post: Posts._id
            }));
            
            await Notification.insertMany(notifications);
        }
        
        await User.findByIdAndUpdate(userId, {
            $push: { blogposts: Posts._id }
        });
        res.redirect('/');
    } catch (error) {
        console.error('Post creation error:', error);
        res.redirect('/');
    }
});

// Like/Unlike route
route.post('/like/:postId', isLogedIn, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    try {
        const post = await BlogPost.findById(postId);
        
        if (!post) {
            return res.json({ success: false, message: 'Post not found' });
        }
        
        // Check if user already liked the post
        const isLiked = post.likes.includes(userId);
        
        if (isLiked) {
            // Unlike
            await BlogPost.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            });
            res.json({ success: true, liked: false, likesCount: post.likes.length - 1 });
        } else {
            // Like
            await BlogPost.findByIdAndUpdate(postId, {
                $push: { likes: userId }
            });
            res.json({ success: true, liked: true, likesCount: post.likes.length + 1 });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Add comment route
route.post('/comment/:postId', isLogedIn, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id;
    const { content } = req.body;
    
    try {
        if (!content || content.trim() === '') {
            return res.json({ success: false, message: 'Comment cannot be empty' });
        }
        
        const comment = await Comment.create({
            content: content.trim(),
            user: userId,
            post: postId
        });
        
        // Populate user info for the comment
        await comment.populate('user', 'name username');
        
        res.json({ 
            success: true, 
            comment: {
                _id: comment._id,
                content: comment.content,
                time: comment.time,
                user: comment.user,
                likes: []
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get comments for a post (Public route - no login required)
route.get('/comments/:postId', async (req, res) => {
    const postId = req.params.postId;
    
    try {
        const comments = await Comment.find({ post: postId })
            .populate('user', 'name username')
            .sort({ time: -1 }); // Newest first
        
        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Like/Unlike comment
route.post('/comment-like/:commentId', isLogedIn, async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user._id;
    
    try {
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.json({ success: false, message: 'Comment not found' });
        }
        
        const isLiked = comment.likes.includes(userId);
        
        if (isLiked) {
            // Unlike
            await Comment.findByIdAndUpdate(commentId, {
                $pull: { likes: userId }
            });
            res.json({ success: true, liked: false, likesCount: comment.likes.length - 1 });
        } else {
            // Like
            await Comment.findByIdAndUpdate(commentId, {
                $push: { likes: userId }
            });
            res.json({ success: true, liked: true, likesCount: comment.likes.length + 1 });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = route;