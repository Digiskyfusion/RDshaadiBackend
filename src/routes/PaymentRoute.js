const express = require("express");
const { createOrder, verifyPayment ,getUserReceipts} = require ("../controller/PaymentController");

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/receipts/:userId", getUserReceipts); // Optional endpoint

module.exports = router;
