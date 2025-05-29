const profileModel = require("../model/ProfileSchema");

const createProfile = async (req, res) => {
  try {
    const {
      userId, // Get this from req.body or req.user (if using authentication)
      ...profileData // All other fields will be captured using the spread operator
    } = req.body;

    // Step 1: Check if profile already exists for this user
    const existingProfile = await profileModel.findOne({ userId });

    if (existingProfile) {
      return res.status(400).json({
        message: "User has already submitted profile.",
        data: existingProfile,
      });
    }

    // Step 2: Create the new profile with all the details
    const newProfile = await profileModel.create({
      userId,
      ...profileData, // Spread all other fields from profileData
    });

    res.status(201).json({
      message: "Profile created successfully!",
      data: newProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while creating the profile.",
      error: error.message,
    });
  }
};


// GET /api/profile/:userId
const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await profileModel.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// PUT /api/profile/:userId (New Update Controller)
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body; // All fields that need to be updated

    // Find the existing profile
    const profile = await profileModel.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update the profile with the new data
    const updatedProfile = await profileModel.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully!",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while updating the profile.",
      error: error.message,
    });
  }
};


module.exports = {createProfile,getProfileById,updateProfile}
