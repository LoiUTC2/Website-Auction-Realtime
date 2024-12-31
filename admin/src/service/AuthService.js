import { toast } from "react-toastify";
import axiosClient from "../utils/axiosConfig";

const authApi = {
    login: async (userinfo) => {
        const login = await axiosClient.post(`/auth/employee/login`, userinfo, { withCredentials: true })
            if (!login.success) {
                return toast.error(login?.message || "Đăng nhập thất bạiii");
            }
        return login 
    },

    sendOTP: async (email) => {
        const send = await axiosClient.post(`/auth/employee/reset-password/send-otp`, email, { withCredentials: true })
            if (!send.success) {
                return toast.error(send?.message || "Gửi OTP thất bạiii");
            }
        return send 
    },

    resetPassword: async (userinfo) => {
        const change = await axiosClient.post(`/auth/employee/reset-password`, userinfo, { withCredentials: true })
            if (!change.success) {
                return toast.error(change?.message || "Thay đổi mật khẩu thất bạiii");
            }
        return change 
    },
}



export default authApi
