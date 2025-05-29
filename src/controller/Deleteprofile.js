  
  const User = require('../model/user');
  const Profile = require('../model/ProfileSchema');
  const PartnerPreference = require('../model/PatnerSchema');
  const DeletedUser = require('../model/DeleteProfiles');
  const otpGenerator = require('otp-generator');
  const twilio = require('twilio');
  const jwt = require('jsonwebtoken');
  const sendEmail = require('../utils/emailSender.js'); // 👈 Import the utility
  const receipt = require("../model/reciept.js")

  const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();


  //  const DeleteUser=async (req, res) => {
  //   const userId = req.user._id;
  //   console.log("userId", userId);
    
  //   const { reason } = req.body;

  //   if (!reason) {
  //     return res.status(400).json({ message: 'Reason is required' });
  //   }

  //   try {
  //     const user = await User.findById(userId);
  //     console.log(user);
      
  //     console.log(user.firstName);
      
  //     if (!user) return res.status(404).json({ message: 'User not found' });

  //     // 1. Save reason in DeletedUser collection
  //     await DeletedUser.create({ userId, reason , firstName:user.firstName, lastName:user.lastName,mobileNumber:user.mobileNumber,emailId:user.emailId,gender:user.gender });

  //     // 2. Delete from User, Profile, PartnerPreference
  //     await User.findByIdAndDelete(userId);
  //     await Profile.findOneAndDelete({ userId });
  //     await PartnerPreference.findOneAndDelete({ userId });

  //     res.status(200).json({ message: 'Profile and related data deleted successfully' });
  //   } catch (error) {
  //     console.error('Error deleting profile:', error);
  //     res.status(500).json({ message: 'Server error' });
  //   }
  // };


  // controllers/userController.js

  const DeleteUser = async (req, res) => {
    const targetUserId = req.params.userId;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    try {
      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Archive user data BEFORE deletion
      await DeletedUser.create({
        userId: user._id,
        reason,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        emailId: user.emailId,
        gender: user.gender,
      });

      // Now delete user and related collections
      await User.findByIdAndDelete(targetUserId);
      await Profile.findOneAndDelete({ userId: targetUserId });
      await PartnerPreference.findOneAndDelete({ userId: targetUserId });
      await receipt.findOneAndDelete({ userId: targetUserId });

      res.status(200).json({ message: 'Profile and related data deleted successfully' });
    } catch (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };




  const requestDeleteProfile = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) return res.status(404).json({ message: 'User not found' });

      const emailOTP = generateOTP();
      const phoneOTP = generateOTP();

      user.deleteEmailOTP = emailOTP;
      user.deletePhoneOTP = phoneOTP;
      user.isDeleteEmailOTPVerified = false;
      user.isDeletePhoneOTPVerified = false;
      await user.save();

      // Send Email OTP
      if (user.emailId) {
        await sendEmail({
          to: user.emailId,
          subject: 'Delete Profile - OTP Verification',
          text: `Your OTP for profile deletion is: ${emailOTP}`
        });
      }

      // Send SMS OTP
      if (user.mobileNumber) {
        await twilioClient.messages.create({
          body: `Your OTP for profile deletion is: ${phoneOTP}`,
          from: process.env.TWILIO_PHONE,
          to: `+91${user.mobileNumber}`,
        });
      }

      res.status(200).json({ message: 'OTP sent to email and phone for profile deletion confirmation' });

    } catch (error) {
      console.error('Error sending OTP for delete:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  // controllers/userController.js

  const confirmDeleteProfile = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const { emailOTP, phoneOTP } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) return res.status(404).json({ message: 'User not found' });

      const emailMatch = user.deleteEmailOTP === emailOTP;
      const phoneMatch = user.deletePhoneOTP === phoneOTP;

      if (!emailMatch || !phoneMatch) {
        return res.status(400).json({
          message: 'Invalid OTP(s)',
          emailOTPMatch: emailMatch,
          phoneOTPMatch: phoneMatch,
        });
      }

      // Optionally archive user data before deletion
      // await DeletedUser.create({ ...user.toObject(), deletedAt: new Date() });

      await user.deleteOne();

      res.status(200).json({ message: 'Profile deleted successfully' });

    } catch (error) {
      console.error('Error verifying delete OTP:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const resendDeleteOTPs = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) return res.status(404).json({ message: 'User not found' });

      const emailOTP = generateOTP();
      const phoneOTP = generateOTP();

      user.deleteEmailOTP = emailOTP;
      user.deletePhoneOTP = phoneOTP;
      user.isDeleteEmailOTPVerified = false;
      user.isDeletePhoneOTPVerified = false;
      await user.save();

      // Resend Email OTP
      if (user.emailId) {
        await sendEmail({
          to: user.emailId,
          subject: 'Resend OTP - Delete Profile Confirmation',
          text: `Your new OTP for profile deletion is: ${emailOTP}`,
        });
      }

      // Resend Phone OTP via SMS
      if (user.mobileNumber) {
        await twilioClient.messages.create({
          body: `Your new OTP for profile deletion is: ${phoneOTP}`,
          from: process.env.TWILIO_PHONE,
          to: `+91${user.mobileNumber}`,
        });
      }

      res.status(200).json({ message: 'New OTPs sent to email and phone' });

    } catch (error) {
      console.error('Error resending delete OTP:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


  module.exports= {DeleteUser, requestDeleteProfile,confirmDeleteProfile ,resendDeleteOTPs};