import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

const openNotify = (type, message) => {
  if (type === 'success') {
    toast.success(message, {
      position: 'top-right',
      duration: 3000,
    });
  } else if (type === 'error') {
    toast.error(message, {
      position: 'top-right',
      duration: 3000,
    });
  } else {
    toast(message, {
      position: 'top-right',
      duration: 3000,
    });
  }
};
const handleResponse = async (response) => {
  if (response.status >= 200 && response.status < 300 && response.data.success === true) {
    return response?.data?.data;
  } else {
    openNotify('error', response?.data?.message || 'An error occurred');
    return null;
  }
};
//Show notify error from api
const handleResponseError = async (error) => {
  if (error.response) {
    // Lỗi từ server với status code
    const { status, data } = error.response;

    if (status === 400) {
      const errorMessage = data.message || 'Bad Request';
      openNotify('error', errorMessage);
    } else if (status === 401) {
      // Xử lý lỗi 401 Unauthorized
      openNotify('error', 'Unauthorized access. Please log in again.');
    } else if (status === 403) {
      // Xử lý lỗi 403 Forbidden
      openNotify('error', 'You do not have permission to perform this action.');
    } else if (status === 404) {
      // Xử lý lỗi 404 Not Found
      openNotify('error', 'The requested resource was not found.');
    } else if (status === 500) {
      // Xử lý lỗi 500 Internal Server Error
      openNotify('error', 'An internal server error occurred. Please try again later.');
    } else {
      // Xử lý các lỗi khác
      openNotify('error', data.message || 'An error occurred');
    }
  } else if (error.request) {
    // Yêu cầu được gửi nhưng không nhận được phản hồi
    openNotify('error', 'No response received from the server. Please check your network connection.');
  } else {
    // Có lỗi khi thiết lập yêu cầu
    openNotify('error', error.message || 'An error occurred.');
  }

};

const formatCurrency = (value) => {
  if (!value)
    value = 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0, // Không hiển thị chữ số thập phân nếu không cần
    maximumFractionDigits: 0
  }).format(value);
};

const countdown = (endsIn) => {
  if (!endsIn) return "";
  const targetDate = new Date(endsIn); 
  const now = Date.now(); // Thời gian hiện tại
  const timeRemaining = targetDate - now; // Thời gian còn lại


  if (timeRemaining <= 0) return "0d 0h 0m"; // Nếu hết thời gian

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
}

function formatDate(dateString) {
  // Nếu không có `date` hoặc `date` không hợp lệ, sử dụng ngày hiện tại
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}


function formatDateTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);

  // Lấy các thành phần ngày, tháng, năm, giờ, phút, giây
  const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo 2 chữ số
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0'); // Đảm bảo 2 chữ số
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Đảm bảo 2 chữ số
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Đảm bảo 2 chữ số

  // Trả về chuỗi đã định dạng theo dd/mm/yyyy hh:mm:ss
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function maskCustomerCode(customerCode) {
  if (!customerCode) return "";
  if (customerCode.length <= 2) {
    // Nếu mã nhân viên ngắn hơn hoặc bằng 2 ký tự, thay bằng dấu *
    return '*'.repeat(customerCode?.length);
  }
  // Mã hóa 2 ký tự cuối thành '*'
  return customerCode.slice(0, -2) + '**';
}
export {
  openNotify,
  handleResponse,
  handleResponseError,
  formatCurrency,
  countdown,
  formatDate,
  formatDateTime,
  maskCustomerCode
}