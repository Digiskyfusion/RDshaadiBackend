const mongoose = require("mongoose");

const patnerProfiles = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  age: { type: Number },
  religion: { type: String }, // FIX: Changed from Date to String
  maritalstatus: { type: String },
  height: { type: String },
  growup: { type: String },
  diet: { type: String },
  community: { type: String },
  healthinformation: { type: String },
  disability: { type: String },
  gothram: { type: String },
  highestqualification: { type: String },
  // workingwith: { type: String },
  // currentresidence: { type: String },
  // stateofresidence: { type: String },
  // residencystatus: { type: String },
  // zippincode: { type: String },
  // mobile: { type: String }, // FIX: Changed to String
  // name: { type: String },
  // whatsappno: { type: String }, // FIX: Changed to String
  // emailId: { type: String },
});

module.exports = mongoose.model("patnerProfile", patnerProfiles);
