const PatnerProfile= require("../model/PatnerSchema")




//create patner

const createPatner = async (req, res) => {
    try {
      const profile = new PatnerProfile(req.body);
      const saved = await profile.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


//get by id
const getPatner= async (req, res) => {
    try {
      const profile = await PatnerProfile.findOne({ userId: req.params.userId });
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  //update
  const updatePatner= async (req, res) => {
    try {
      const updated = await PatnerProfile.findOneAndUpdate(
        { userId: req.params.userId },
        req.body,
        { new: true, upsert: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  const deletePatner= async (req, res) => {
    try {
      const deleted = await PatnerProfile.findOneAndDelete({ userId: req.params.userId });
      if (!deleted) return res.status(404).json({ message: "Profile not found" });
      res.json({ message: "Profile deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  module.exports= {
    createPatner,
    getPatner,
    updatePatner,
    deletePatner
  }