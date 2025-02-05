// src/models/EcoTip.js
const mongoose = require('mongoose');

const ecoTipSchema = new mongoose.Schema({
  tip: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('EcoTip', ecoTipSchema);