const express = require('express')
const User = require('../modules/user')
const BlogPost = require('../modules/postmodule')  // Add this
const Notification = require('../modules/notificationmodule')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const route = express.Router()
const isLogedIn = require('../utils/isLogeedIn')

// Multer configuration for profile photos
const profilePhotoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile-photos/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const profilePhotoFilter = (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowed for profile photos!'), false)
    }
}

const uploadProfilePhoto = multer({ 
    storage: profilePhotoStorage,
    fileFilter: profilePhotoFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

// Create profile-photos directory if it doesn't exist
const profilePhotosDir = 'public/profile-photos'
if (!fs.existsSync(profilePhotosDir)){
    fs.mkdirSync(profilePhotosDir, { recursive: true })
}

route.get('/profile/:username', isLogedIn, async (req, res) => {
    const savedata = req.params.username.slice(1).replace('@','')
    const data = await User.findOne({username: savedata})
    const currentUser = await User.findById(req.user._id)
    
    // Debug logs
    console.log('Profile data:', {
        username: data.username,
        followers: data.followers ? data.followers.length : 0,
        following: data.following ? data.following.length : 0,
        followersArray: data.followers,
        followingArray: data.following
    });
    
    // Get posts by this user
    const userPosts = await BlogPost.find({users: data._id})
    
    res.render('profile', {D: data, userData: currentUser, posts: userPosts})
})


// Follow/Unfollow route
route.post('/follow/:userId', isLogedIn, async (req, res) => {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;
    
    console.log('Follow request:', { currentUserId, targetUserId });
    
    // Don't follow yourself
    if (currentUserId.toString() === targetUserId) {
        return res.json({ success: false, message: "You can't follow yourself" });
    }
    
    try {
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);
        
        console.log('Current user:', currentUser.username);
        console.log('Target user:', targetUser.username);
        console.log('Current user following:', currentUser.following);
        console.log('Target user followers:', targetUser.followers);
        
        if (!targetUser) {
            return res.json({ success: false, message: "User not found" });
        }
        
        // Initialize arrays if they don't exist
        if (!currentUser.following) currentUser.following = [];
        if (!targetUser.followers) targetUser.followers = [];
        
        // Check if already following
        const isFollowing = currentUser.following.includes(targetUserId);
        console.log('Is following:', isFollowing);
        
        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: targetUserId }
            });
            await User.findByIdAndUpdate(targetUserId, {
                $pull: { followers: currentUserId }
            });
            
            // Get updated counts
            const updatedTargetUser = await User.findById(targetUserId);
            const updatedCurrentUser = await User.findById(currentUserId);
            
            const newFollowersCount = updatedTargetUser.followers ? updatedTargetUser.followers.length : 0;
            const newFollowingCount = updatedTargetUser.following ? updatedTargetUser.following.length : 0;
            
            console.log('After unfollow - Target followers:', newFollowersCount);
            console.log('After unfollow - Current following:', updatedCurrentUser.following ? updatedCurrentUser.following.length : 0);
            
            res.json({ 
                success: true, 
                following: false,
                followersCount: newFollowersCount,
                followingCount: newFollowingCount
            });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, {
                $push: { following: targetUserId }
            });
            await User.findByIdAndUpdate(targetUserId, {
                $push: { followers: currentUserId }
            });
            
            // Create notification
            await Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow'
            });
            
            // Get updated counts
            const updatedTargetUser = await User.findById(targetUserId);
            const updatedCurrentUser = await User.findById(currentUserId);
            
            const newFollowersCount = updatedTargetUser.followers ? updatedTargetUser.followers.length : 0;
            const newFollowingCount = updatedTargetUser.following ? updatedTargetUser.following.length : 0;
            
            console.log('After follow - Target followers:', newFollowersCount);
            console.log('After follow - Current following:', updatedCurrentUser.following ? updatedCurrentUser.following.length : 0);
            
            res.json({ 
                success: true, 
                following: true,
                followersCount: newFollowersCount,
                followingCount: newFollowingCount
            });
        }
    } catch (error) {
        console.error('Follow error:', error);
        res.json({ success: false, message: error.message });
    }
});

// Test route to check follower counts
route.get('/test-followers/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username: username});
        
        if (!user) {
            return res.json({ error: 'User not found' });
        }
        
        res.json({
            username: user.username,
            followers: user.followers ? user.followers.length : 0,
            following: user.following ? user.following.length : 0,
            followersArray: user.followers,
            followingArray: user.following
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Debug route to check follower counts
route.get('/debug-followers/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username: username});
        
        if (!user) {
            return res.json({ error: 'User not found' });
        }
        
        // Get actual follower count
        const followersCount = user.followers ? user.followers.length : 0;
        const followingCount = user.following ? user.following.length : 0;
        
        res.json({
            username: user.username,
            name: user.name,
            followers: followersCount,
            following: followingCount,
            followersArray: user.followers,
            followingArray: user.following,
            _id: user._id
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Test route to manually add a follower (for testing)
route.get('/test-add-follower/:targetUsername/:followerUsername', async (req, res) => {
    try {
        const targetUsername = req.params.targetUsername;
        const followerUsername = req.params.followerUsername;
        
        const targetUser = await User.findOne({username: targetUsername});
        const followerUser = await User.findOne({username: followerUsername});
        
        if (!targetUser || !followerUser) {
            return res.json({ error: 'User not found' });
        }
        
        // Add follower
        await User.findByIdAndUpdate(targetUser._id, {
            $addToSet: { followers: followerUser._id }
        });
        
        await User.findByIdAndUpdate(followerUser._id, {
            $addToSet: { following: targetUser._id }
        });
        
        // Get updated counts
        const updatedTarget = await User.findById(targetUser._id);
        
        res.json({
            success: true,
            message: `${followerUsername} is now following ${targetUsername}`,
            followers: updatedTarget.followers ? updatedTarget.followers.length : 0,
            following: updatedTarget.following ? updatedTarget.following.length : 0
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Profile photo upload route
route.post('/upload-profile-photo', isLogedIn, uploadProfilePhoto.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No file uploaded' });
        }
        
        const userId = req.user._id;
        const photoPath = `/profile-photos/${req.file.filename}`;
        
        // Update user's profile photo
        await User.findByIdAndUpdate(userId, {
            image: photoPath
        });
        
        res.json({ 
            success: true, 
            message: 'Profile photo updated successfully',
            photoPath: photoPath
        });
    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.json({ success: false, message: error.message });
    }
});

module.exports = route