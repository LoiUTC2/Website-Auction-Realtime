const express = require('express');
const router = express.Router();
const { getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loginCustomer,
    sendOTPCreateAccount,
    sendOTPForPasswordReset,
    resetPassword,
    verifyOTP,
    getUserRegisteredAuctions,
    getTransactionHistory,
} = require('../controllers/customer.controller');
const { verifyAccessToken } = require('../middlewares/Authentication');

router.post('/login', loginCustomer);
router.post('/register-otp', sendOTPCreateAccount);
router.post('/resetpassword-otp', sendOTPForPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/resetpassword', resetPassword);
router.post('/', createCustomer);

router.get('/history-register',verifyAccessToken, getUserRegisteredAuctions);
router.get('/history-transactions',verifyAccessToken, getTransactionHistory);
router.get('/:id', verifyAccessToken, getCustomerById);

router.put('/', verifyAccessToken, updateCustomer);

router.delete('/:id', deleteCustomer);

module.exports = router;