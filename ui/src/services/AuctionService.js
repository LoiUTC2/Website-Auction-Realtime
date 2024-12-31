import { handleResponse, handleResponseError, openNotify } from "../commons/MethodsCommons";
import axiosClient from "../config/axiosClient";

const AuctionService = {
    register: async (auctionInfo) => {
        if (!auctionInfo) {
            openNotify('error', 'auctionInfo is required')
            return;
        }
        try {
            const response = await axiosClient.post('/auctions/register', auctionInfo, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getList: async ({ limit, page, status }) => {
        try {
            const response = await axiosClient.get('/auctions/', { params: { limit, page, status } });
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getDetail: async (auctionSlug) => {
        try {
            const hasViewed = sessionStorage.getItem(`viewed-${auctionSlug}`);
            if (!hasViewed)
                sessionStorage.setItem(`viewed-${auctionSlug}`, 'true');
            const response = await axiosClient.get(`/auctions/${auctionSlug}`, {
                params: {
                    viewed: !!hasViewed,
                }
            });
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getOutstanding: async ({ limit, page, status }) => {
        try {
            const response = await axiosClient.get(`auctions/outstanding`, { params: { limit, page,status } });
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getOnGoing: async ({ limit, page }) => {
        try {
            const response = await axiosClient.get(`auctions/ongoing`, { params: { limit, page } });
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    checkUserRegistration: async (roomId) => {
        try {
            const response = await axiosClient.get(`auctions/${roomId}/check-valid-access`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getURlPayment: async (paymentData) => {
        try {
            const response = await axiosClient.post(`payment/vnpay/create_payment_url`, paymentData);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    checkPaymentStatus: async (transactionId) => {
        try {
            const response = await axiosClient.get(`payment/vnpay/detail/${transactionId}`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getMyAuctions: async () => {
        try {
            const response = await axiosClient.get(`auctions/my-auctioned`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    updateBankInfo: async (auctionId,values) => {
        try {
            const response = await axiosClient.put(`auctions/${auctionId}/bank-info`,{bankInfo:{...values}});
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    confirmAuction: async (values) => {
        try {
            const response = await axiosClient.post(`auctions/comfirmation`,values);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    updateStatus: async (auctionId,value) => {
        try {
            const response = await axiosClient.put(`auctions/${auctionId}/status`,{status:value});
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },


}

export default AuctionService;
