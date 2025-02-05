// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
 try {
   const { email, password, userType, organizationName, organizationSize, familyMembers } = req.body;

   const existingUser = await User.findOne({ email });
   if (existingUser) {
     return res.status(400).json({ error: 'Email already exists' });
   }

   // Validation based on user type
   if (userType === 'business') {
     if (!organizationName || !organizationSize) {
       return res.status(400).json({ 
         error: 'Organization name and size required for business registration'
       });
     }
   } else if (userType === 'family') {
     if (!familyMembers || !Array.isArray(familyMembers) || familyMembers.length === 0) {
       return res.status(400).json({
         error: 'At least one family member required for family registration'
       });
     }
   }

   const userData = {
     email,
     password,
     userType
   };

   if (userType === 'business') {
     userData.organizationName = organizationName;
     userData.organizationSize = organizationSize;
   } else if (userType === 'family') {
     userData.familyMembers = familyMembers.map(member => ({
       name: member.name,
       role: member.role
     }));
   }

   const user = new User(userData);
   await user.save();

   const token = jwt.sign(
     { 
       userId: user._id,
       userType: user.userType,
       organizationName: user.organizationName 
     },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );

   res.status(201).json({ 
     message: 'Registration successful',
     token,
     userType: user.userType
   });

 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

router.post('/login', async (req, res) => {
 try {
   const { email, password } = req.body;
   const user = await User.findOne({ email });

   if (!user || !(await user.comparePassword(password))) {
     return res.status(401).json({ error: 'Invalid credentials' });
   }

   const token = jwt.sign(
     { 
       userId: user._id,
       userType: user.userType,
       organizationName: user.organizationName
     },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );

   const response = {
     token,
     userType: user.userType,
     message: 'Login successful'
   };

   if (user.userType === 'business') {
     response.organizationName = user.organizationName;
     response.organizationSize = user.organizationSize;
   } else if (user.userType === 'family') {
     response.familyMembers = user.familyMembers;
   }

   res.json(response);

 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

module.exports = router;