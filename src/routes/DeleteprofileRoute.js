const express = require('express');
const router = express.Router();
const {DeleteUser, requestDeleteProfile,confirmDeleteProfile, resendDeleteOTPs}= require("../controller/Deleteprofile")
const protect= require("../middleware/authMiddleware")


router.route('/delete-profile/:userId').post(protect,DeleteUser);
router.route('/delete-profile/request').post(protect,requestDeleteProfile);
router.route('/delete-profile/confirm').post(protect,confirmDeleteProfile);
router.route('/resend-delete-otp').post(protect,resendDeleteOTPs);

module.exports = router;