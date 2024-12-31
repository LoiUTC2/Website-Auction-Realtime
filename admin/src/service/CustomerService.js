import { toast } from "react-toastify";
import axiosClient from "utils/axiosConfig";

const CustomerAPI = {
    getById: async (id) => {
        if (!id) {
            return;
        }
        try {
            const response = await axiosClient.get(`customers/${id}`);
            if (!response.success) {
                return toast.error(response?.message || "Lấy chi tiết thông tin khách hàng thất bại!");
            }
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lấy thông tin KH thất bại";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },


}

export default CustomerAPI;
