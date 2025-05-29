const mongoose = require('mongoose');

const deletedUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName:{type:String},
  lastName:{type:String},
  mobileNumber:{type:String},
  emailId:{type:String},
  gender:{type:String},
  reason: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedUser', deletedUserSchema);
