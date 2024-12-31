import { toast } from "react-toastify";
import axiosClient from "src/utils/axiosConfig"

const inventoryApi={

    create: async (values) => {
        const newRole = await axiosClient.post('/inventory/import', values).then(result => {
            if (!result.success) {
                toast.error(result.message || "Nhập kho thất bại");
                return false;
            }
            toast.success(result.message || "Nhập kho thành công");
            return true;
        })
    },
    getAll: async () => {
        const data = await axiosClient.get('/inventory');
        if (data.success)
            return data.data;
        return toast.error('Lấy phiếu nhập hàng thất bại.');
    },
    getByID:async (id)=> {
        const data = await axiosClient.get(`inventory/${id}`);
        if (data.success)
            return data;
        return toast.error('Lấy thông tin phiếu nhập hàng thất bại');
    }


}

export default inventoryApi