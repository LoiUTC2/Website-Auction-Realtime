import { handleResponse, handleResponseError, openNotify } from "../commons/MethodsCommons";
import axiosClient from "../config/axiosClient";

const ProfileService = {
    getById: async (id) => {
        if (!id) {
            return;
        }
        try {
            const response = await axiosClient.get(`customers/${id}`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getNotify: async () => {
        try {
            const response = await axiosClient.get(`notifications`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    makeReadNotify: async () => {
        try {
            const response = await axiosClient.post(`notifications/makeRead/all`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getNotifyCount: async () => {
        try {
            const response = await axiosClient.get(`notifications/count`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    updateProfile: async (values) => {
        if (!values) {
            return;
        }
        const payload = JSON.stringify(values)
        try {
            const response = await axiosClient.put(`customers`,payload);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Fetch data failed');
        }
    },
    getHistoryRegister: async () => {
        try {
            const response = await axiosClient.get(`customers/history-register`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
    getHistoryTransaction: async () => {
        try {
            const response = await axiosClient.get(`customers/history-transactions`);
            const data = await handleResponse(response);
            return data;
        } catch (error) {
            handleResponseError(error)
        }
    },
}

export default ProfileService;
