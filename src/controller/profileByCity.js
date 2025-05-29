const profileModel = require("../model/ProfileSchema");


// const profileByCity = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         console.log("Request for userId:", userId);

//         // Find the current user's profile
//         const currentUser = await profileModel.findOne({ userId });
//         console.log("Current user profile:", currentUser);

//         if (!currentUser) {
//             return res.status(404).json({ message: "No user profile found." });
//         }

//         // Find other users in the same city, excluding the current user
//         const usersInSameCity = await profileModel.find({
//             city: currentUser.city,
//             userId: { $ne: userId },
//         }).populate("userId");

//         if (!usersInSameCity || usersInSameCity.length === 0) {
//             return res.status(404).json({ message: "No users found in this city." });
//         }

//         return res.status(200).json({ users: usersInSameCity });
//     } catch (error) {
//         console.error("Error fetching profiles by city:", error);
//         return res.status(500).json({
//             message: "Something went wrong.",
//             error: error.message,
//         });
//     }
// };

const profileByCity = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("Request for userId:", userId);

        // Find the current user's profile
        const currentUser = await profileModel.findOne({ userId });
        console.log("Current user profile:", currentUser);

        if (!currentUser) {
            return res.status(404).json({ message: "No user profile found." });
        }

        // Find other users in the same city, excluding the current user
        const usersInSameCity = await profileModel.find({
            city: currentUser.city,
            userId: { $ne: userId },
        }).populate("userId");

        // Always return 200, with users array (empty if none found)
        return res.status(200).json({ users: usersInSameCity });
    } catch (error) {
        console.error("Error fetching profiles by city:", error);
        return res.status(500).json({
            message: "Something went wrong.",
            error: error.message,
        });
    }
};


module.exports = { profileByCity };