const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: String,
  lastName: String,
  email: String,
  mobileNumber: String,
  //  amount: Number, // 👈 Add this field
  creditsAdded: Number,
  totalCredits: Number,
  planName: String,
  paymentId: String,
  orderId: String,
  paymentDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("Receipt", receiptSchema);
