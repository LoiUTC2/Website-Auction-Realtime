import { handleResponse, handleResponseError, openNotify } from "../commons/MethodsCommons";
import axiosClient from "../config/axiosClient";

const HomeService = {
    login: async (username, password) => {
        // Kiểm tra nếu username hoặc password không hợp lệ
        if (!username || !password) {
            openNotify('error','Username and password are required')
            return;
        }
        const payload = JSON.stringify({
            username,
            password,
        });

        try {
            const response = await axiosClient.post('/customers/login', payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
           handleResponseError(error)
        }
    },
    sendOTP: async (values) => {
        if (!values) {
            return;
        }
        const payload = JSON.stringify({email:values})
        try {
            const response = await axiosClient.post(`/customers/register-otp`,payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    sendOTPForgotPassword: async (values) => {
        if (!values) {
            return;
        }
        const payload = JSON.stringify({email:values})
        try {
            const response = await axiosClient.post(`/customers/resetpassword-otp`,payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            return handleResponseError(error)
        }
    },
    verifyOTP: async (values) => {
        if (!values) {
            return;
        }
        const payload = JSON.stringify(values)
        try {
            const response = await axiosClient.post(`/customers/verify-otp`,payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
           return handleResponseError(error)
        }
    },
    resetPassword: async (values) => {
        if (!values) {
            return;
        }
        const payload = JSON.stringify(values)
        try {
            const response = await axiosClient.post(`/customers/resetpassword`,payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            return handleResponseError(error)
        }
    },
    createAccount: async (values) => {
        if (!values) {
            return;
        }
        const payload = JSON.stringify(values)
        try {
            const response = await axiosClient.post(`/customers`,payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            return handleResponseError(error)
        }
    },
}

export default HomeService;
