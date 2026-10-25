const mongoose = require('mongoose');

const judgeSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
    courtName: { type: String, default: 'District Court' },
    courtLevel: { type: String, enum: ['District Court', 'High Court', 'Supreme Court'], default: 'District Court' },
    courtLocation: { type: String, default: '' },
    courtroom: { type: String, default: 'Courtroom Hall 1' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    designation: { type: String, default: 'District Judge' },
    registrationNumber: { type: String, default: 'JDG-8821' },
    specialization: { type: String, default: 'Civil & Criminal Litigation' },
    jurisdiction: { type: String, default: 'District Jurisdiction' },
    yearsServing: { type: Number, default: 10 },
    availability: { type: String, enum: ['Available', 'Busy', 'On Leave', 'In Session'], default: 'Available' },
    status: { type: String, enum: ['Active', 'On Leave', 'Transferred', 'Retired'], default: 'Active' },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String },
    contactEmail: { type: String },
    phone: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Judge', judgeSchema);
