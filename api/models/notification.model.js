const mongoose = require('mongoose');
const { NotificationType } = require('../common/constant');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
	type: { type: String, enum: Object.values(NotificationType), default: NotificationType.INFO },
	title: { type: String, required: true },
	message: { type: String, required: true },
	isRead: { type: Boolean, default: false },
	metadata: { type: Object, default: {} },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = {
	Notification: mongoose.model('Notification', NotificationSchema),
};
