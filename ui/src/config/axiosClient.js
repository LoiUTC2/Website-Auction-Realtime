import axios from 'axios';

const axiosClient = axios.create({
    // baseURL: 'http://localhost:5008/api',
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
    timeout: 20000, 
    headers: {
        'Content-Type': 'application/json'
      }
});

// Thêm interceptor để thiết lập token vào header của mỗi request
axiosClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để cập nhật token trong local storage nếu nó được trả về
axiosClient.interceptors.response.use(
    (response) => {
        const newAccessToken = response.headers['x-new-access-token'];
        if (newAccessToken) {
            localStorage.setItem('token', newAccessToken); 
        }

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token'); // Remove token if not authorized
        }

        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default axiosClient;
