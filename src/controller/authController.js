const User = require('../model/user.js');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailSender.js'); // 👈 Import the utility

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// SEND OTP
exports.sendOTP = async (req, res) => {
  const { emailId, mobileNumber } = req.body;

  const emailOTP = generateOTP();
  const phoneOTP = generateOTP();

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        emailId,
        mobileNumber,
        emailOTP,
        phoneOTP,
        isVerifiedEmail: false,
        isVerifiedPhone: false
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send email using utility
    await sendEmail({
      to: emailId,
      subject: 'Your Email OTP',
      text: `Your email OTP is: ${emailOTP}`
    });

    // Send phone OTP using Twilio
    await twilioClient.messages.create({
      body: `Your phone OTP is: ${phoneOTP}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${mobileNumber}`,
    });

    res.status(200).json({ message: 'OTP sent to email and phone' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { emailOTP, phoneOTP } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const verifiedEmail = user.emailOTP === emailOTP;
    const verifiedPhone = user.phoneOTP === phoneOTP;

    if (!verifiedEmail || !verifiedPhone) {
      return res.status(400).json({
        message: 'Invalid OTP(s)',
        emailVerified: verifiedEmail,
        phoneVerified: verifiedPhone,
      });
    }

    user.isVerifiedEmail = true;
    user.isVerifiedPhone = true;
    await user.save();

    res.status(200).json({ message: 'Email and phone verified successfully' });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// RESEND OTP
exports.resendOTP = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();

    user.emailOTP = emailOTP;
    user.phoneOTP = phoneOTP;
    user.isVerifiedEmail = false;
    user.isVerifiedPhone = false;
    await user.save();

    // Email OTP
    if (user.emailId) {
      await sendEmail({
        to: user.emailId,
        subject: 'Your Email OTP (Resent)',
        text: `Your new email OTP is: ${emailOTP}`
      });
    }

    // SMS OTP
    if (user.mobileNumber) {
      await twilioClient.messages.create({
        body: `Your new phone OTP is: ${phoneOTP}`,
        from: process.env.TWILIO_PHONE,
        to: `+91${user.mobileNumber}`,
      });
    }

    res.status(200).json({ message: 'OTP resent to email and phone' });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
