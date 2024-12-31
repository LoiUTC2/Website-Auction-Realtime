const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { UserStatus } = require('../common/constant');

const UserSchema = new Schema(
	{
		fullName: { type: String, required: true, trim: true },
		username: { type: String, required: true, unique: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true, lowercase: true },
		gender: { type: String, required: true},
		address: { type: String },
		phoneNumber: { type: String, required: true, unique: true, trim: true },
		hashedPassword: { type: String, required: true },
		status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
		avatar: { type: String, default: 'https://i.imgur.com/iNsPoYP.jpg' },
		// rolePer: [{ type: Schema.Types.ObjectId, ref: 'Role' }], //List role, role->permission
		rolePermission: { type: mongoose.Schema.Types.ObjectId, ref: 'RolePermission', require: true}, 
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	},
	{ timestamps: true },
);

UserSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

const RefreshTokenSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
	token: { type: String, required: true },
	sessionKey: { type: String, required: true },
	expiresAt: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now, expires: '30d' },
});

module.exports = {
	User: mongoose.model('User', UserSchema),
	RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
};
