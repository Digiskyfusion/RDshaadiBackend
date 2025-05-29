const razorpay  = require("../config/razorpay.js");
const crypto  = require("crypto");
const User  = require("../model/user.js");
const Receipt  = require("../model/reciept.js");

// Create Razorpay Order
 const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options)
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verify Payment and Save Receipt
 const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    plan,
    planName,
  } = req.body;

  try {
    // Step 1: Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
      console.log("generaet",generated_signature);
      console.log("razorpay",razorpay_signature);
      
      

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Step 2: Get user
    const user = await User.findById(userId);
    console.log(user);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 3: Credits to add
    const creditsToAdd = parseInt(plan);
    if (isNaN(creditsToAdd)) {
      return res.status(400).json({ error: "Invalid plan value" });
    }

    // Step 4: Update user credits
    user.credits = (user.credits || 0) + creditsToAdd;
    await user.save();

    // Step 5: Create and save receipt
    const savedReceipt = new Receipt({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailId,
      mobileNumber: user.mobileNumber,
      creditsAdded: creditsToAdd,
      totalCredits: user.credits,
      planName: planName || "Custom Plan",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentDate: new Date(),
    });

    await savedReceipt.save();

    // Step 6: Respond
    res.status(200).json({
      message: `Payment verified successfully.`,
      receipt: savedReceipt,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ error: "Failed to verify payment and update credits." });
  }
};


//without increase payment verify
// const verifyPayment = async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     userId,
//     plan,
//     planName,
//   } = req.body;

//   try {
//     // Step 1: Verify signature
//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     console.log("generated:", generated_signature);
//     console.log("razorpay:", razorpay_signature);

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid signature" });
//     }

//     // Step 2: Get user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Step 3: (Skip updating user credits)
//     const creditsToAdd = parseInt(plan);
//     if (isNaN(creditsToAdd)) {
//       return res.status(400).json({ error: "Invalid plan value" });
//     }

//     // Step 4: Just create and save receipt (keep totalCredits unchanged)
//     const savedReceipt = new Receipt({
//       userId: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.emailId,
//       mobileNumber: user.mobileNumber,
//       // amount: amount || 0, // 👈 Add this line to show plan price
//       // creditsAdded: creditsToAdd,
//       // totalCredits: user.credits || 0,  // unchanged
//       planName: planName || "Custom Plan",
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       paymentDate: new Date(),
//     });

//     await savedReceipt.save();

//     // Step 5: Respond
//     res.status(200).json({
//       message: `Payment verified successfully.`,
//       receipt: savedReceipt,
//     });
//   } catch (err) {
//     console.error("Error verifying payment:", err);
//     res.status(500).json({ error: "Failed to verify payment." });
//   }
// };


// Optional: Get all receipts for a user
 const getUserReceipts = async (req, res) => {
  try {
    const { userId } = req.params;
    const receipts = await Receipt.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(receipts);
    console.log(receipts);
    
  } catch (err) {
    console.error("Error fetching receipts:", err);
    res.status(500).json({ error: "Failed to fetch receipts." });
  }
};


module.exports={
    createOrder,
    verifyPayment,
    getUserReceipts,
}
