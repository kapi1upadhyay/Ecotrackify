// src/routes/ecoFriendlyPractices.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EcoTip = require('../models/EcoTip');

router.get('/', auth, async (req, res) => {
  try {
    const practices = await EcoTip.find().sort({ createdAt: -1 });
    res.json({ practices });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const tip = new EcoTip({
      tip: req.body.tip,
      user: req.user._id
    });
    await tip.save();
    res.status(201).json({ message: 'Tip shared successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
});

module.exports = router;
