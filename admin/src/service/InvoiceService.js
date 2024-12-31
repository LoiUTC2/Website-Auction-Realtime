import { toast } from "react-toastify";
import axiosClient from "../utils/axiosConfig"

const invoiceApi = {
    getAllProduct: async () => {
        const productList = await axiosClient.get('/product');
        if (!productList) {
            toast.error("Không tìm thấy sản phẩm");
            return;
        }
        return productList;
    },
    getByID: async (id) => {
        const invoiceInfo = await axiosClient.get(`/invoice/${id}`);
        if (!invoiceInfo.success) {
           return toast.error("Không tìm thấy sản phẩm");
        }
        return invoiceInfo;
    },
    getInvoicePending: async () => {
        const invoiceList = await axiosClient.get(`/invoice/filter/3`);
        if (!invoiceList.success)
        {
            return toast.error("Không tìm thấy hóa đơn");
        }
        return invoiceList
    },
    getInvoiceList: async () => {
        const invoiceList = await axiosClient.get(`/invoice/filter/6`);
        if (!invoiceList.success)
        {
            return toast.error("Không tìm thấy hóa đơn");
        }
        return invoiceList
    },
    approveInvoice: async (id) => {
        const invoiceInfo = await axiosClient.put(`/invoice/update/accept/${id}`);
        if (!invoiceInfo.success)
        {
            return toast.error("Không thể duyệt hóa đơn này!")
        }
        return invoiceInfo;
    },
    rejectInvoice: async (id) => {
        const invoiceInfo = await axiosClient.put(`/invoice/update/reject/${id}`);
        if (!invoiceInfo.success)
        {
            return toast.error("Không thể duyệt hóa đơn này!")
        }
        return invoiceInfo;
    }
    // create: async (values,files) => {
    //     const formData = new FormData();
    //     formData.append('ProductName', values.ProductName);
    //     formData.append('Description', values.Description);
    //     formData.append('OriginPrice', values.OriginPrice);
    //     formData.append('SellPrice', values.SellPrice);
    //     formData.append('BrandID', values.BrandID);
    //     formData.append('GenderID', values.GenderID);
    //     formData.append('DialSizeID', values.DialSizeID);
    //     formData.append('StrapMaterialID', values.StrapMaterialID);
    //     formData.append('WaterResistanceID', values.WaterResistanceID);
    //     formData.append('Color', values.Color);
    //     formData.append('TagID', values.Tag);
    //     formData.append('DialShapeID', values.DialShapeID);
    //     formData.append('StatusID', values.StatusID);
    //     files && files.forEach(image => {
    //         formData.append('Image',image)
    //     });
    //     try {
    //         const result = await axiosClient.post(`/product/createnew`, formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
                
    //         }).catch((res) => {
    //             toast.error(res.errors.Description[0]);
    //         });
    
    //         if (!result.success ) {
    //             toast.error(result.message);
    //             return false;
    //         }
    //             toast.success("Thêm mới sản phẩm thành công");
    //             return result;
            
    //     } catch (error) {
    //         toast.error("An error occurred while creating the product.");
    //         return false;
    //     }
    // },
    // delete: async (id) => {
    //     return await axiosClient.delete(`/product/delete/${id}`).then(result => {
    //         if (!result.listStatus.success) {
    //             toast.error(result.message);
    //             return false
    //         }
    //         toast.success("Xóa sản phẩm thành công.");
    //         return true
    //     })
    // },
    // update: async (values,files,newImages) => {
    //     const formData = new FormData();
    //     formData.append('ProductName', values.ProductName);
    //     formData.append('Description', values.Description);
    //     formData.append('OriginPrice', values.OriginPrice);
    //     formData.append('SellPrice', values.SellPrice);
    //     formData.append('BrandID', values.BrandID);
    //     formData.append('GenderID', values.GenderID);
    //     formData.append('DialSizeID', values.DialSizeID);
    //     formData.append('StrapMaterialID', values.StrapMaterialID);
    //     formData.append('WaterResistanceID', values.WaterResistanceID);
    //     formData.append('Color', values.Color);
    //     formData.append('TagID', values.Tag);
    //     formData.append('DialShapeID', values.DialShapeID);
    //     formData.append('StatusID', values.StatusID);
    //     files && files.forEach(image => {
    //         formData.append('newImages',image)
    //     });
    //     newImages && newImages.forEach(item => {
    //         formData.append('newImagesID', item)
    //     });
    //     try {
    //         const result = await axiosClient.put(`/product/update/${values.ProductID}`, formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
                
    //         }).catch((res) => {
    //             toast.error(res.errors.Description[0]);
    //         });
    
    //         if (!result.success ) {
    //             toast.error(result.message);
    //             return false;
    //         }
    //             toast.success("Cập nhật sản phẩm thành công");
    //             return result;
            
    //     } catch (error) {
    //         toast.error("An error occurred while creating the product.");
    //         return false;
    //     }
        
    // }
    


}

export default invoiceApi