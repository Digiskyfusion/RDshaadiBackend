const express= require("express");
const router= express.Router()
const userProfile= require("../controller/profileController")
const protect= require("../middleware/authMiddleware")

router.route("/profile").post(protect,userProfile.createProfile)
router.route("/profileget/:userId").get(userProfile.getProfileById)
router.route("/profileupdate/:userId").put(userProfile.updateProfile)

module.exports= router;