const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  profileFor: String,
  firstName: String,
  lastName: String,
  mobileNumber: String,
  emailId: String,
  dob: Date,
  gender: {
    type: String,
    enum: ["Male", "Female","Other"],
    default: "Male",
  },
  password: String,
  // emailOTP: String,
  // phoneOTP: String,
  profileImage: { 
    type: String,  // you can store a URL for the image here
    default: "https://img.freepik.com/free-psd/contact-icon-illustration-isolated_23-2151903337.jpg?t=st=1746177507~exp=1746181107~hmac=dee8c5e1b4e2f4af2c284b22413fb56a35d8a84c3ea9bfe101652a15dc7a60cc&w=826"    // optional, default to an empty string or a placeholder image
  },
  token:{
    type:String,
    default:""
  },
  tokenExpiresAt: {
    type: Date,
    default: null, // add this line
  },
   credits: {
  type: Number,
  default: 0,
},
// deleteEmailOTP: { type: String },
// deletePhoneOTP: { type: String },
// isDeleteEmailOTPVerified: { type: Boolean, default: false },
// isDeletePhoneOTPVerified: { type: Boolean, default: false },
//   isVerifiedEmail: { type: Boolean, default: false },
//   isVerifiedPhone: { type: Boolean, default: false },
}, { timestamps: true }); // optional: adds createdAt & updatedAt fields

module.exports = mongoose.model("User", userSchema);
