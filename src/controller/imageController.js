const Image = require("../model/Image");

// CREATE: Save image URLs
const uploadImages = async (req, res) => {
  try {
    const { userId, images } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: "Invalid image array" });
    }

    // Find existing document by userId
    let existingEntry = await Image.findOne({ userId });

    if (existingEntry) {
      // Option 1: Replace existing images with new images
      existingEntry.images = images;

      // Option 2: Append new images to existing ones (uncomment if you want append)
      // existingEntry.images = [...existingEntry.images, ...images];

      await existingEntry.save();
      return res.status(200).json({ message: "Images updated", data: existingEntry });
    }

    // If not found, create new entry
    const newEntry = new Image({ userId, images });
    await newEntry.save();
    res.status(201).json({ message: "Images uploaded", data: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// READ: Get all image entries
const getImages = async (req, res) => {
  try {
    const entries = await Image.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE: Update image array by ID
const updateImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images, title } = req.body;

    const updated = await Image.findByIdAndUpdate(
      id,
      { images, title },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Image entry not found" });
    }

    res.status(200).json({ message: "Updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE: Delete image entry by ID
const deleteImages = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Image.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Image entry not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  uploadImages,
  getImages,
  updateImages,
  deleteImages,
};
