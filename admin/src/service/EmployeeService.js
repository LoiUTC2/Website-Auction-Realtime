import { toast } from "react-toastify";
import axiosClient from "../utils/axiosConfig";
const employeeApi = {
    getAllEmployee: async () => {
        const userList = await axiosClient.get(`/user/getall`);
        if (!userList) {
            toast.error("Không tìm thấy người dùng");
            return;
        }
        return userList;
    },
    getByID: async (id) => {
        const userInfo = await axiosClient.get(`/user/getUserByID/${id}`);
        if (!userInfo) {
            toast.error("Không tìm thấy người dùng");
            return;
        }
        return userInfo;
    },
    create: async (values) => {
        try {
            const result = await axiosClient.post(`/user`, values);
            console.log("KQ:", result);
            if (result.success) {
                console.log("KQ1:", result.data);
                toast.success(result.message);
                // const createUserToRole = {
                //     UserID: Number(result.user.data.userID),
                //     RoleID: Number(values.RoleID)
                // };
    
                // const result2 = await axiosClient.post('/usertorole/createnew', createUserToRole);
    
                // if (!result2.success) {
                //     toast.error(result2.data.message);
                //     return false;
                // }
                return result;
            } else {
                toast.error(result.message);
                return false;
            }
        } catch (error) {
            // toast.error("An error occurred while creating the user.");
            console.error("Lỗi khi gọi API:", error);
            const errorMessage = error.response?.data?.message || "Đăng kí thất bại";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    },
    delete: async (id) => {
        return await axiosClient.delete(`/user/${id}`).then(result => {
            if (!result.success) {
                toast.error(result.message);
                return false
            }
            toast.success(result.message);
            return true
        })
    },
    update: async (id, values) => {
        var model = {
            // ...values,
            fullName: values.fullName,
            username: values.username,
            email: values.email,
            address: values.address,
            gender: values.gender,
            phoneNumber: values.phoneNumber,
            rolePermission: values.rolePermission,
            status: values.status,
        }

        return await axiosClient.patch(`/user/${id}`, model).then(result => {
            if (!result.success) 
                toast.error(result.message);
            toast.success(result.message);
        })
        
    }
    


}

export default employeeApi