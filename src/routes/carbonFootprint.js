const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  try {
    const { date, transportation, energyConsumption, wasteDisposal } = req.body;

    // Validate and parse date
    const entryDate = new Date(date);
    if (isNaN(entryDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Ensure consistent date comparison (set to start of the day in UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    entryDate.setUTCHours(0, 0, 0, 0);

    if (entryDate > today) {
      return res.status(400).json({ 
        error: 'Cannot track carbon footprint for future dates' 
      });
    }

    const totalFootprint = transportation + energyConsumption + wasteDisposal;

    const entry = {
      date: entryDate,
      transportation,
      energyConsumption,
      wasteDisposal,
      totalFootprint
    };

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.carbonEntries.push(entry);
    await user.save();

    res.json({
      message: 'Carbon footprint tracked successfully',
      entry
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
