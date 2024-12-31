// Format giá trị thành số tiền tệ
export const formatCurrency = (value) => {
    return value != null && value !== ''
      ? new Intl.NumberFormat('vi-VN', {
          style: 'decimal', // Chỉ định dạng số bình thường, không phải tiền tệ
          maximumFractionDigits: 0, // Không hiển thị phần thập phân
        }).format(value)
      : '';
  };
  
  // Parse giá trị nhập vào, loại bỏ tất cả ký tự không phải số
  export const parseCurrency = (formattedValue) => {
    const cleaned = formattedValue.replace(/[^\d]/g, ''); // Loại bỏ ký tự không phải số
    return cleaned ? parseInt(cleaned, 10) : null;
  };