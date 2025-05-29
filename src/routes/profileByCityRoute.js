const express= require("express");
const router= express.Router();
const profileByCity = require("../controller/profileByCity");
const protect= require("../middleware/authMiddleware")

router.route("/profilebycity/:userId").get(profileByCity.profileByCity);

module.exports= router;