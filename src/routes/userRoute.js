
const express= require("express");
const router = express.Router();
const authForm= require("../controller/mutliform");
const protect = require("../middleware/authMiddleware");


router.route("/register").post(authForm.multiForm);
router.route("/login").post(authForm.login);
router.route("/:id").get(authForm.getById);
router.route('/:id').put(authForm.updateUser);
router.route('/opposite/:userId').get(authForm.getBygender);
router.route('/user-Profile/:userId').get(authForm.getProfileWithUser);
router.route("/forget-password").post(authForm.forgetPassword);
router.route("/reset-password").post(authForm.resetPassword);
router.route("/credits/:userId").post(authForm.connectHandler);
module.exports= router;