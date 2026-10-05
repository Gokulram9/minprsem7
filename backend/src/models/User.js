const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['User', 'Lawyer', 'Admin'],
      default: 'User',
    },
    phone: { type: String },
    location: { type: String },
    specialization: { type: String },
    experienceYears: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    availability: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
