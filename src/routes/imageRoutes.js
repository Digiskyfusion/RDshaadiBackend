const express = require("express");
const router = express.Router();
const {
  uploadImages,
  getImages,
  updateImages,
  deleteImages,
} = require("../controller/imageController");

router.post("/", uploadImages);       // POST /api/images
router.get("/", getImages);           // GET  /api/images
router.put("/:id", updateImages);     // PUT  /api/images/:id
router.delete("/:id", deleteImages);  // DELETE /api/images/:id

module.exports = router;
