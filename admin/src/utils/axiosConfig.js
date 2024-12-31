import axios from "axios";

const axiosClient = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials:true
    
});

axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) return response.data
    },
    (err) => {
        return Promise.reject(err)
    }
);
export default axiosClient;