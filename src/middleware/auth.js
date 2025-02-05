// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header) {
      return res.status(401).json({error: 'No token provided'});
    }

    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({error: 'Invalid token format'});
    }

    const token = header.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({error: 'Invalid token'});
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({error: 'Authentication failed'});
  }
};

module.exports = auth;