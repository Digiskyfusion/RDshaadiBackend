const sendMail = require("../utils/emailSender");
const mongoose = require("mongoose");
const User = require("../model/user");

// const clickButton = async (req, res) => {
//   try {
//     const viewerEmail = req.user?._id; // Ensure req.user is defined

//     const { id } = req.body; // ID of the profile clicked

//     // Validate MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     // Get details of the clicked user
//     const clickedUser = await User.findById(id).select("firstName lastName emailId mobileNumber");

//     if (!clickedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const fullName = `${clickedUser.firstName} ${clickedUser.lastName}`;

//     const html = `
//       <p><strong>${viewerEmail}</strong> clicked the <strong>Connect</strong> button on the following profile:</p>
//       <ul>
//         <li><strong>Name:</strong> ${fullName}</li>
//         <li><strong>Email:</strong> ${clickedUser.emailId}</li>
//         <li><strong>Mobile Number:</strong> ${clickedUser.mobileNumber}</li>
//       </ul>
//     `;

//     await sendMail({
//       to: process.env.EMAIL_USER,
//       subject: "🔔 Connect Button Clicked",
//       html,
//     });

//     res.status(200).json({ message: "Admin notified successfully" });
//   } catch (error) {
//     console.error("Error sending mail:", error);
//     res.status(500).json({ message: "Failed to notify admin" });
//   }
// };

const clickButton = async (req, res) => {
  try {
    const { viewerId, id: clickedUserId } = req.body;

    // Validate both viewer and clicked user IDs
    if (!mongoose.Types.ObjectId.isValid(viewerId) || !mongoose.Types.ObjectId.isValid(clickedUserId)) {
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    // Fetch viewer details
    const viewer = await User.findById(viewerId).select("firstName lastName emailId mobileNumber");
    if (!viewer) {
      return res.status(404).json({ message: "Viewer not found" });
    }

    // Fetch clicked profile details
    const clickedUser = await User.findById(clickedUserId).select("firstName lastName emailId mobileNumber");
    console.log(clickedUser);
    
    if (!clickedUser) {
      return res.status(404).json({ message: "Clicked user not found" });
    }

    const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 30px auto; padding: 25px; border-radius: 16px; background: linear-gradient(to bottom right, #ffffff, #f4f4f8); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1); border: 1px solid #e3e6f0;">
  <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 22px;">🔗 New Connection Request</h2>

  <div style="padding: 20px; background: #ffffff; border: 1px solid #dcdde1; border-radius: 12px; margin-bottom: 20px;">
    <h3 style="color: #2d3436; margin-bottom: 12px;">🙋‍♂️ Request Sent By:</h3>
    <ul style="list-style: none; padding-left: 0; margin: 0; color: #34495e; font-size: 15px;">
      <li style="margin-bottom: 8px;"><strong>Name:</strong> ${viewer.firstName} ${viewer.lastName}</li>
      <li style="margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${viewer.emailId}" style="color: #3498db; text-decoration: none;">${viewer.emailId}</a></li>
      <li><strong>Mobile:</strong> <a href="tel:${viewer.mobileNumber}" style="color: #3498db; text-decoration: none;">${viewer.mobileNumber}</a></li>
    </ul>
  </div>

  <p style="color: #34495e; font-size: 16px; margin-bottom: 20px;">
    has shown interest in connecting with the following profile:
  </p>

  <div style="padding: 20px; background: #ffffff; border: 1px solid #dcdde1; border-radius: 12px;">
    <h3 style="color: #2d3436; margin-bottom: 12px;">👤 Profile Interested In:</h3>
    <ul style="list-style: none; padding-left: 0; margin: 0; color: #34495e; font-size: 15px;">
      <li style="margin-bottom: 8px;"><strong>Name:</strong> ${clickedUser.firstName} ${clickedUser.lastName}</li>
      <li style="margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${clickedUser.emailId}" style="color: #0984e3; text-decoration: none;">${clickedUser.emailId}</a></li>
      <li><strong>Mobile:</strong> <a href="tel:${clickedUser.mobileNumber}" style="color: #0984e3; text-decoration: none;">${clickedUser.mobileNumber}</a></li>
    </ul>
  </div>

  <p style="margin-top: 25px; font-size: 14px; color: #7f8c8d; text-align: center;">
    📬 This connection request was initiated from your platform.
  </p>
</div>



    `;

    await sendMail({
      to: process.env.EMAIL_USER,
      subject: "🔔 Connect Button Clicked",
      html,
    });

    res.status(200).json({ message: "Admin notified successfully" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ message: "Failed to notify admin" });
  }
};

module.exports= {clickButton};