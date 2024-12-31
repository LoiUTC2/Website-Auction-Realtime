const express = require('express');
const router = express.Router();

const { validateBodyRequest } = require("../middlewares/validation.middleware");
const { employeeLogin, employeeSendOTPCode, employeeResetPassword } = require("../controllers/auth.controller");
const { employeeLoginSchema, employeeResetPasswordSchemaSendOTPSchema, employeeResetPasswordSchema } = require("../validations")



router.post('/employee/login', validateBodyRequest(employeeLoginSchema), employeeLogin);
router.post('/employee/reset-password/send-otp', validateBodyRequest(employeeResetPasswordSchemaSendOTPSchema), employeeSendOTPCode);
router.post('/employee/reset-password', validateBodyRequest(employeeResetPasswordSchema), employeeResetPassword);


module.exports = router;