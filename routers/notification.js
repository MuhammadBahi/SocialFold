const express = require('express')
const Notification = require('../modules/notificationmodule')
const route = express.Router()
const isLogedIn = require('../utils/isLogeedIn')

// Get user notifications
route.get('/notifications', isLogedIn, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name username image')
            .populate('post', 'title')
            .sort({ time: -1 })
            .limit(20);
        
        res.json({ success: true, notifications });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Mark notification as read
route.post('/notifications/:notificationId/read', isLogedIn, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.notificationId, {
            read: true
        });
        
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Mark all notifications as read
route.post('/notifications/read-all', isLogedIn, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );
        
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get unread notification count
route.get('/notifications/unread-count', isLogedIn, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });
        
        res.json({ success: true, count });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = route 