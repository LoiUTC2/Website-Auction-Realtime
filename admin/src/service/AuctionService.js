import { AUCTION_STATUS } from "commons/Constant";
import { toast } from "react-toastify";
import axiosClient from "utils/axiosConfig";

const auctionAPI = {

    getNewAuction: async () => {
        const newAuctionAPI = await axiosClient.get(`/auctions?status=${AUCTION_STATUS.PENDING}`, { withCredentials: true })
            if (!newAuctionAPI.success) {
                return toast.error(newAuctionAPI?.message || "Lấy danh sách phiên đấu giá đang chờ phê duyệt");
            }
        return newAuctionAPI 
    },

    getPendingAuction: async () => {
        const pendingAuctionAPI = await axiosClient.get(`/auctions?status=${AUCTION_STATUS.APPROVED}`, { withCredentials: true })
            if (!pendingAuctionAPI.success) {
                return toast.error(pendingAuctionAPI?.message || "Lấy danh sách phiên đấu giá sắp diễn ra thất bại");
            }
        return pendingAuctionAPI 
    },

    getActiveAuction: async () => {
        const activeAuctionAPI = await axiosClient.get(`/auctions?status=${AUCTION_STATUS.ACTIVE}`, { withCredentials: true })
            if (!activeAuctionAPI.success) {
                return toast.error(activeAuctionAPI?.message || "Lấy danh sách phiên đấu giá đang diễn ra thất bại");
            }
        return activeAuctionAPI 
    },

    getEndedAuction: async () => {
        const endedAuctionAPI = await axiosClient.get(`/auctions?status=${AUCTION_STATUS.COMPLETED}`, { withCredentials: true })
            if (!endedAuctionAPI.success) {
                return toast.error(endedAuctionAPI?.message || "Lấy danh sách phiên đấu giá đã kết thúc thất bại");
            }
        return endedAuctionAPI 
    },

    getCancelledAuction: async () => {
        const cancelAuctionAPI = await axiosClient.get(`/auctions?status=${AUCTION_STATUS.REJECTED}`, { withCredentials: true })
            if (!cancelAuctionAPI.success) {
                return toast.error(cancelAuctionAPI?.message || "Lấy danh sách phiên đấu giá từ chối thất bại");
            }
        return cancelAuctionAPI 
    },

    approve: async (userId, id, values) => {
        try {
            if (!id || typeof id !== 'string') {
                throw new Error("Invalid Auction ID: ID must be a valid string");
            }

            const approveAPI = await axiosClient.put(`/auctions/approve/${id}/${userId}`, values, 
                { 
                    withCredentials: true, 
                    headers: { 
                        'Content-Type': 'application/json'  
                    } 
                })
                if (!approveAPI.success) {
                    return toast.error(approveAPI?.message || "Phê duyệt thất bại");
                }
            return approveAPI 
        } catch (error) {
            console.error("Error in approve API:", error);
            throw error; // Để handleSubmit xử lý lỗi
        }
    },

    reject: async (userId, id, reason) => {
        const rejectAPI = await axiosClient.put(`/auctions/reject/${id}/${userId}`,{ reason },
            { 
                withCredentials: true, 
                headers: { 
                    'Content-Type': 'application/json'  
                } 
            })
            if (!rejectAPI.success) {
                return toast.error(rejectAPI?.message || "Từ chối thất bạiii");
            }
        return rejectAPI 
    },

    updateAuction: async (userId, id, values) => {
        try {
            const updateAuctionAPI = await axiosClient.put(`/auctions/update/${id}/${userId}`, values, 
                { 
                    withCredentials: true, 
                    headers: { 
                        'Content-Type': 'application/json'  
                    } 
                })
                if (!updateAuctionAPI.success) {
                    return toast.error(updateAuctionAPI?.message || "Điều chỉnh thất bại");
                }
            return updateAuctionAPI 
        } catch (error) {
            console.error("Error in update API:", error);
            throw error; // Để handleSubmit xử lý lỗi
        }
    },

    endAuction: async (userId, id, reason) => {
        const endAuctionAPI = await axiosClient.put(`/auctions/end/${id}/${userId}`,{ reason },
            { 
                withCredentials: true, 
                headers: { 
                    'Content-Type': 'application/json'  
                } 
            })
            if (!endAuctionAPI.success) {
                return toast.error(endAuctionAPI?.message || "Từ chối thất bạiii");
            }
        return endAuctionAPI 
    },

    kickCustomerOutOfAuction: async (auctionId, customerId, userId) => {
        const kickCustomerOutOfAuctionAPI = await axiosClient.delete(`/auctions/kickCustomer/${auctionId}/${customerId}/${userId}`, { withCredentials: true })
            if (!kickCustomerOutOfAuctionAPI.success) {
                return toast.error(kickCustomerOutOfAuctionAPI?.message || "Xóa khách hàng khỏi phiên đấu giá thất bại");
            }
        return kickCustomerOutOfAuctionAPI 
    },

    deleteHistoryManagementAction: async (auctionId, managementActionId) => {
        const deleteHistoryAuctionAPI = await axiosClient.delete(`/auctions/deleteHistory/${auctionId}/${managementActionId}`, { withCredentials: true })
            if (!deleteHistoryAuctionAPI.success) {
                return toast.error(deleteHistoryAuctionAPI?.message || "Xóa lịch sử quản lý đấu giá thất bại");
            }
        return deleteHistoryAuctionAPI 
    },

    getDetailAuctionByID: async (id_Auction) => {
        const detailAuctionAPI = await axiosClient.get(`/auctions/getDetailAuctionByID/${id_Auction}`, { withCredentials: true })
            if (!detailAuctionAPI.success) {
                return toast.error(detailAuctionAPI?.message || "Lấy chi tiết phiên đấu giá thất bại");
            }
        return detailAuctionAPI 
    },

    getDetailAuction: async (auctionSlug) => {
        const detailAuctionAPI = await axiosClient.get(`/auctions/${auctionSlug}`, { withCredentials: true })
            if (!detailAuctionAPI.success) {
                return toast.error(detailAuctionAPI?.message || "Lấy chi tiết phiên đấu giá thất bại");
            }
        return detailAuctionAPI 
    },
}



export default auctionAPI
