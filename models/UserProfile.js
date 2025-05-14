const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['Admin', 'User', 'Editor'],
    default: 'User'
  },
  avatar: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
