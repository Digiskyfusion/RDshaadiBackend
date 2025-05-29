const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  userId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true,
     },
  images: {
    type: [String], // Firebase image URLs
  },
}, { timestamps: true });

module.exports = mongoose.model("Image", imageSchema);
