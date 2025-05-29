const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP,resendOTP } = require('../controller/authController');
const protect= require("../middleware/authMiddleware")

router.route('/send-otp').post(protect,sendOTP);
router.route('/verify-otp').put(protect,verifyOTP);
router.route('/resend-otp').post(protect,resendOTP);


module.exports = router;
