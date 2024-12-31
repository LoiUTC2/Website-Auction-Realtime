import { toast } from "react-toastify";
import axiosClient from "../utils/axiosConfig"

const roleApi={
    getAllRolePermission : async ()=> {
        const roleList =await axiosClient.get('/role/getAllRolePermission');
        if (!roleList)
        {
            toast.error("Không tìm thấy vai trò nào");
            return;
        }
        return roleList;
    },

    getRolePermissionByID: async (id) => {
        const roleInfo = await axiosClient.get(`/role/getRolePermissionById/${id}`);
        if (!roleInfo)
        {
            toast.error("Không tìm thấy rolePermission");
            return;
        }
        return roleInfo;
    },

    getRolePermissionByIdUser: async (id_User) => {
        const rolePermission = await axiosClient.get(`role/getRolePermissionByIdUser/${id_User}`);
        if (!rolePermission.success) {
            toast.error(rolePermission.message || "Lấy rolePermisson thất bại");
            return rolePermission;
        }
        // toast.success(roleName.message || "Lấy roleName thành công");
        return rolePermission;
    },

    createRolePermission: async (values) => {
        // values.RoleID = Number(values.RoleID);
        const create = await axiosClient.post('/role/createRolePermission', values)
            if (!create.success) {
                toast.error(create.message || "Tạo vai trò thất bại");
                return create;
            }
            toast.success(create.message || "Tạo vai trò thành công");
            return create;
        
    },
    updateRolePermission: async (id_RolePermission, values) => {
        const rolePermission = await axiosClient.put(`/role/updateRolePermission/${id_RolePermission}`, values)
            if (!rolePermission.success) {
                toast.error(rolePermission.message || "Cập nhật vai trò thất bại");
                return rolePermission;
            }
            toast.success(rolePermission.message || "Cật nhật vai trò thành công");
            return rolePermission;
    },

    deleteRolePermission: async (id_RolePermission) => {
        const rolePermission = await axiosClient.delete(`/role/deleteRolePermission/${id_RolePermission}`)
            if (!rolePermission.success) {
                
                toast.error(rolePermission.message || "Xóa vai trò thất bại");
                return rolePermission;
            }
            toast.success(rolePermission.message || "Xóa vai trò thành công");
            return rolePermission;
    },
    
}

export default roleApi