const UserStatus = Object.freeze({
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Không hoạt động',
    SUSPENDED: 'Cấm'
});

const PRODUCT_CATEGORY = {
    ELECTRONICS: 'Electronics',           // Các sản phẩm điện tử
    FASHION: 'Fashion',                   // Quần áo, phụ kiện
    JEWELRY: 'Jewelry',                   // Đồ trang sức, kim hoàn
    ART: 'Art',                           // Tranh ảnh, điêu khắc
    REAL_ESTATE: 'RealEstate',           // Đất đai, nhà cửa
    VEHICLE: 'Vehicle',                   // Xe cộ, phương tiện
    COLLECTOR_ITEMS: 'CollectorItems',   // Đồ sưu tầm
    FURNITURE: 'Furniture',               // Đồ đạc, nội thất
    ANTIQUES: 'Antiques',                 // Các vật phẩm cổ
    SPORTS_EQUIPMENT: 'SportsEquipment', // Dụng cụ thể thao
    BOOKS: 'Books',                       // Sách, tài liệu
    OTHER: 'Other'                        // Các loại khác
};
const PRODUCT_CONDITION = Object.freeze({
    NEW: 'New',
    USED: 'Used',
    REFURBISHED: 'Refurbished',    
});
const PRODUCT_TYPE = {
    PERSONAL_ITEM: 'Personal Item',       // Vật dụng cá nhân
    COLLECTIBLE: 'Collectible',           // Đồ sưu tầm
    RARE: 'Rare',                    // Vật phẩm hiếm
    LIMITED: 'Limited',   // Sản phẩm phát hành giới hạn
    VINTAGE: 'Vintage',                   // Đồ cổ, thuộc thế hệ cũ
    STANDARD: 'Standard',                 // Sản phẩm tiêu chuẩn
    PREMIUM: 'Premium'                    // Sản phẩm cao cấp
};
const ProductStatus = Object.freeze({
    pending: 'Đang chờ đấu giá',
    active: 'Đang đấu giá',
    sold: 'Đã bán', 
    cancelled: 'Đã hủy',
});

const NotificationType = Object.freeze({
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success', 
    ERROR: 'error',
});

const TransactionStatus = Object.freeze({
    DRAFT: 'draft',
    SUCCESSED: 'successed',
    FAILURE: 'failure'
});

const PaymentGateways = Object.freeze({
    VNPAY: 'vnpay',
    MOMO: 'momo',
    PAYPAL: 'paypal'
});

const EmailType = Object.freeze({
    RESET_PASSWORD_OTP: "reset-password-otp",
    NOTIFY_TO_AUCTION_WINNER: "notify-to-auction-winner",
    NOTIFY_TO_PRODUCT_OWNER: "notify-to-product-owner"
});

const VNPayResponse = Object.freeze({
    SUCCESS: { RspCode: "00", Message: "Giao dịch thành công" },
    SUSPECTED_FRAUD: { RspCode: "07", Message: "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)." },
    NOT_REGISTERED: { RspCode: "09", Message: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng." },
    AUTHENTICATION_FAILED: { RspCode: "10", Message: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần." },
    PAYMENT_TIMEOUT: { RspCode: "11", Message: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch." },
    ACCOUNT_LOCKED: { RspCode: "12", Message: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa." },
    OTP_INCORRECT: { RspCode: "13", Message: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch." },
    CUSTOMER_CANCELED: { RspCode: "24", Message: "Giao dịch không thành công do: Khách hàng hủy giao dịch." },
    INSUFFICIENT_FUNDS: { RspCode: "51", Message: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch." },
    DAILY_LIMIT_EXCEEDED: { RspCode: "65", Message: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày." },
    BANK_MAINTENANCE: { RspCode: "75", Message: "Ngân hàng thanh toán đang bảo trì." },
    MAX_RETRY_EXCEEDED: { RspCode: "79", Message: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch." },
    OTHER_ERROR: { RspCode: "99", Message: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)." }
});

const  IpnResponse = Object.freeze({
    IpnSuccess : { RspCode: '00', Message: 'Confirm Success' },
    IpnOrderNotFound : { RspCode: '01', Message: 'Order not found' },
    IpnInvalidAmount : { RspCode: '04', Message: 'Invalid amount' },
    IpnFailChecksum : { RspCode: '97', Message: 'Fail checksum' },
    IpnUnknownError : { RspCode: '99', Message: 'Unknown error' },
})
const REDIS_KEYS = {
    AUCTION_ROOM: (roomId) => `auction:${roomId}`,
    BID_HISTORY: (roomId) => `auction:${roomId}:bids`,
    AUCTION_CHAT: (roomId) => `auction:${roomId}:chat`,
    SCHEDULED_AUCTIONS: (roomId) => `auction_schedule:${roomId}`,
};
//Flow: Đăng ký đấu giá=> sản phẩm đang chờ vận chuyển đến => đã nhận(chỉ cho phép duyệt đấu giá với điều kiện đã nhận SP) => Đấu giá trong transfer cho winner
const PRODUCT_STATUS = {
    PENDING_DELIVERY: 'Pending_Delivery',
    RECEIVED: 'Received',
    TRANSFERRED: 'Transferred',
};
//Flow: Đăng ký đấu giá=>pending=>duyệt/từ chối=>đang trong thời gian đấu giá=>kết thúc=>Chờ winner thanh toán => done
const AUCTION_STATUS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    WINNER_PAYMENTED: 'Winner_Paymented',
    DONE: 'Done',
    CANCELED: 'Canceled',
    REJECTED: 'Rejected',
};


module.exports = {
    UserStatus,
    PRODUCT_CATEGORY,
    PRODUCT_CONDITION,
    PRODUCT_TYPE,
    ProductStatus,
    NotificationType,
    EmailType,
    TransactionStatus,
    PaymentGateways,
    VNPayResponse,
    IpnResponse,
    REDIS_KEYS,
    PRODUCT_STATUS,
    AUCTION_STATUS
};