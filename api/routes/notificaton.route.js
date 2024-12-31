const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const { Notification } = require('../models/notification.model');
const { default: mongoose } = require('mongoose');
const { formatResponse } = require('../common/MethodsCommon');
const { verifyAccessToken } = require('../middlewares/Authentication');
const router = express.Router();

router.get(
	'/count',
	verifyAccessToken,
	expressAsyncHandler(async (req, res) => {
		try {
			const { userId } = req.user;
			const { type } = req.query;

			// Lọc thông báo chưa đọc (isRead: false)
			const matchConditions = {
				$and: [
					{ ownerId: new mongoose.Types.ObjectId(userId) },
					{ isRead: false }, // Điều kiện lọc thông báo chưa đọc
					type ? { type } : {} // Kiểm tra nếu có query 'type'
				],
			};

			// Đếm tổng số thông báo chưa đọc
			const count = await Notification.countDocuments(matchConditions);

			// Trả về số lượng thông báo chưa đọc
			return res.json(formatResponse(true, { count }, 'Tổng số thông báo chưa đọc'));
		} catch (error) {
			console.error('Lỗi khi đếm số lượng thông báo:', error);
			res.status(500).json(formatResponse(false, null, 'Đã xảy ra lỗi khi đếm số lượng thông báo.'));
		}
	}),
);
router.get(
	'/',
	verifyAccessToken,
	expressAsyncHandler(async (req, res) => {
		try {
			const { userId } = req.user;
			const { limit = 10, page = 1, type } = req.query;
			const parsedLimit = parseInt(limit, 10);
			const parsedPage = parseInt(page, 10);
			const skip = (parsedPage - 1) * parsedLimit;

			const pipeline = [
				{
					$match: {
						$and: [{ ownerId: new mongoose.Types.ObjectId(userId) }, type ? { type }: {}],
					},
				},
				{ $skip: skip },
				{ $limit: parsedLimit },
			];

			const result = await Notification.aggregate(pipeline);
			return res.json(formatResponse(true, result, ''));
		} catch (error) {
			console.error('Lỗi khi lấy danh sách thông báo:', error);
			res.status(500).json(formatResponse(false, null, 'Đã xảy ra lỗi khi lấy danh sách thông báo.'));
		}
	}),
);

router.post(
	'/makeRead/all',
	verifyAccessToken,
	expressAsyncHandler(async (req, res) => {
        const { userId } = req.user;

		await Notification.updateMany({ ownerId: userId, isRead: false }, { $set: { isRead: true } });

		return res.json(formatResponse(true));
	}),
);

router.post(
	'/makeRead/:notifyId',
	verifyAccessToken,
	expressAsyncHandler(async (req, res) => {
		const { notifyId } = req.params;
        const { userId } = req.user;

		await Notification.findOneAndUpdate({ _id: notifyId, ownerId: userId }, { $set: { isRead: true } });

		return res.json(formatResponse(true));
	}),
);

module.exports = router;
