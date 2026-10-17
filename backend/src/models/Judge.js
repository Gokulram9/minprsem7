const mongoose = require('mongoose');

const judgeSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
    courtName: { type: String, default: 'District Court' },
    courtroom: { type: String, default: 'Courtroom Hall 1' },
    designation: { type: String, default: 'High Court Judge' },
    registrationNumber: { type: String, default: 'JDG-8821' },
    specialization: { type: String, default: 'Civil & Criminal Litigation' },
    jurisdiction: { type: String, default: 'Western Province Jurisdiction' },
    yearsServing: { type: Number, default: 10 },
    status: { type: String, enum: ['Active', 'On Leave', 'Transferred', 'Retired'], default: 'Active' },
    profileImage: { type: String },
    contactEmail: { type: String },
    phone: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Judge', judgeSchema);
