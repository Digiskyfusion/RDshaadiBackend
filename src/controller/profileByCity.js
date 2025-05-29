const profileModel = require("../model/ProfileSchema");


const profileByCity = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("Request for userId:", userId);

        // Get the current user's profile and populate user data (to access gender)
        const currentUserProfile = await profileModel.findOne({ userId }).populate("userId");
        console.log(currentUserProfile);
        

        if (!currentUserProfile) {
            return res.status(404).json({ message: "No user profile found." });
        }

        const currentUserGender = currentUserProfile.userId.gender;
        const currentUserCity = currentUserProfile.city;

        // Build gender filter based on current user's gender
        let genderFilter = {};
        if (currentUserGender === "Male") {
            genderFilter["userId.gender"] = "Female";
        } else if (currentUserGender === "Female") {
            genderFilter["userId.gender"] = "Male";
        } else if (currentUserGender === "Other") {
            genderFilter["userId.gender"] = { $in: ["Male", "Female"] };
        }

        // Find other users in the same city, excluding current user, and apply gender filter
        const usersInSameCity = await profileModel.find({
            city: currentUserCity,
            userId: { $ne: userId }
        })
        .populate({
            path: "userId",
            match: genderFilter["userId.gender"] ? { gender: genderFilter["userId.gender"] } : {},
        });

        // Filter out null userId (those that didn't match gender in populate)
        const filteredUsers = usersInSameCity.filter(u => u.userId !== null);

        return res.status(200).json({ users: filteredUsers });

    } catch (error) {
        console.error("Error fetching profiles by city:", error);
        return res.status(500).json({
            message: "Something went wrong.",
            error: error.message,
        });
    }
};

module.exports = { profileByCity };