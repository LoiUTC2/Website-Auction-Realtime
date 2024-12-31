const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ProductCategory, ProductCondition, ProductStatus, PRODUCT_STATUS, PRODUCT_CATEGORY, PRODUCT_CONDITION, PRODUCT_TYPE } = require('../common/constant')

const ProductSchema = new Schema({
  productName: { type: String, required: true },
  description: { type: String, required: true },// Mô tả chi tiết về sản phẩm
  address: { type: String, required: true },// Địa chỉ của sản phẩm
  seller: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },// ID của người dki đấu giá
  images: [{ type: String }],
  category: { type: String, enum: Object.values(PRODUCT_CATEGORY)},
  type: { type: String, enum: Object.values(PRODUCT_TYPE)},
  condition: { type: String,enum: Object.values(PRODUCT_CONDITION)},// Tình trạng sản phẩm: mới, đã sử dụng, tân trang
  status: { type: String, enum: Object.values(PRODUCT_STATUS), default: PRODUCT_STATUS.PENDING_DELIVERY},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date}
});

module.exports = mongoose.model('Product', ProductSchema);