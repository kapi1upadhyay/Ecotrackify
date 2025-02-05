// src/routes/sustainabilityGoals.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    req.user.sustainabilityGoals = req.body.goals.map(goal => ({
      goal: goal.goal,
      progress: 0
    }));
    await req.user.save();
    res.json({ message: 'Sustainability goals set successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    res.json({ goals: req.user.sustainabilityGoals });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    req.user.sustainabilityGoals = req.body.goals;
    await req.user.save();
    res.json({ message: 'Sustainability goals updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
});

module.exports = router;

