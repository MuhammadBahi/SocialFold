const mongoose = require('mongoose')
const NotificationSchema = require('../Schema/notification-Schema')

module.exports = mongoose.model("Notification", NotificationSchema) 