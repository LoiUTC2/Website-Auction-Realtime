export const AUCTION_STATUS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    WINNER_PAYMENTED: 'Winner_Paymented',
    DONE: 'Done',
    CANCELED: 'Canceled',
    REJECTED: 'Rejected',
}
export const MODAL_TYPES = {
    VIEW: 'VIEW',
    UPDATE: 'UPDATE',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    CANCEL: 'CANCEL',
    RECOVER: 'RECOVER',
    END: 'END'
};


export const ProductCategory = Object.freeze({
    Art_Collectibles: 'Nghệ thuật và Sưu tập',
    Jewelry_Watches: 'Trang sức và Đồng hồ',
    Furniture_HomeDecor: 'Đồ nội thất và Trang trí',
    Vehicles: 'Xe cộ',
    Real_Estate: 'Bất động sản',
    Electronics_Technology: 'Đồ điện tử và Công nghệ',
    Fashion_Accessories: 'Thời trang và Phụ kiện',
    Wine_Beverages: 'Rượu và Đồ uống',
    Books_RareDocuments: 'Sách và Tài liệu quý',
    EventTickets_Experiences: 'Vé sự kiện và Trải nghiệm',
});

export const ProductCondition = Object.freeze({
    new: 'Mới',
    used: 'Đã sử dụng',
    refurbished: 'Tân trang',
});

export const ProductStatus = Object.freeze({
    pending: 'Đang chờ đấu giá',
    active: 'Đang đấu giá',
    sold: 'Đã bán',
    cancelled: 'Đã hủy',
});
export const PRODUCT_STATUS = {
    PENDING_DELIVERY: 'Pending_Delivery',
    RECEIVED: 'Received',
    TRANSFERRED: 'Transferred',
};

export const PRODUCT_CATEGORY_DATASOURCE = [
    { value: 'Electronics', label: 'Các sản phẩm điện tử' },
    { value: 'Fashion', label: 'Quần áo, phụ kiện' },
    { value: 'Jewelry', label: 'Đồ trang sức, kim hoàn' },
    { value: 'Art', label: 'Tranh ảnh, điêu khắc' },
    { value: 'RealEstate', label: 'Đất đai, nhà cửa' },
    { value: 'Vehicle', label: 'Xe cộ, phương tiện' },
    { value: 'CollectorItems', label: 'Đồ sưu tầm' },
    { value: 'Furniture', label: 'Đồ đạc, nội thất' },
    { value: 'Antiques', label: 'Các vật phẩm cổ' },
    { value: 'SportsEquipment', label: 'Dụng cụ thể thao' },
    { value: 'Books', label: 'Sách, tài liệu' },
    { value: 'Other', label: 'Các loại khác' }
];

export const PRODUCT_CONDITION_DATASOURCE = [
    { value: 'New', label: 'Mới' },
    { value: 'Used', label: 'Đã qua sử dụng' },
    { value: 'Refurbished', label: 'Tân trang' }
];

export const PRODUCT_TYPE_DATASOURCE = [
    { value: 'Personal Item', label: 'Vật dụng cá nhân' },
    { value: 'Collectible', label: 'Đồ sưu tầm' },
    { value: 'Rare', label: 'Vật phẩm hiếm' },
    { value: 'Limited', label: 'Sản phẩm phát hành giới hạn' },
    { value: 'Vintage', label: 'Đồ cổ, thuộc thế hệ cũ' },
    { value: 'Standard', label: 'Sản phẩm tiêu chuẩn' },
    { value: 'Premium', label: 'Sản phẩm cao cấp' }
];

export const PRODUCT_STATUS_DATASOURCE = [
    { value: 'Pending_Delivery', label: 'Đang chờ giao hàng' },
    { value: 'Received', label: 'Đã nhận' },
    { value: 'Transferred', label: 'Đã chuyển' }
];

export const AUCTION_STATUS_DATASOURCE = [
    { value: 'Pending', label: 'Chờ duyệt' },
    { value: 'Approved', label: 'Đã phê duyệt' },
    { value: 'Active', label: 'Đang diễn ra' },
    { value: 'Completed', label: 'Hoàn thành' },
    { value: 'Winner_Paymented', label: 'Đã thanh toán' },
    { value: 'Done', label: 'Hoàn tất' },
    { value: 'Canceled', label: 'Đã hủy' },
    { value: 'Rejected', label: 'Từ chối' }
  ];