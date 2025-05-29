const express = require("express");
const router = express.Router();
const patnerAuth= require("../controller/patnerController")


router.route("/").post(patnerAuth.createPatner)
router.route("/:userId").get(patnerAuth.getPatner)
router.route("/:userId").put(patnerAuth.updatePatner)
router.route("/:userId").delete(patnerAuth.deletePatner)

module.exports = router;