// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const carbonEntrySchema = new mongoose.Schema({
 date: {
   type: Date,
   required: true,
   validate: {
     validator: function(date) {
       return date <= new Date();
     },
     message: 'Cannot track carbon footprint for future dates'
   }
 },
 transportation: {
   type: Number,
   required: true,
   min: 0
 },
 energyConsumption: {
   type: Number,
   required: true,
   min: 0
 },
 wasteDisposal: {
   type: Number,
   required: true,
   min: 0
 },
 totalFootprint: {
   type: Number,
   required: true,
   min: 0
 }
}, {timestamps: true});

const sustainabilityGoalSchema = new mongoose.Schema({
 category: {
   type: String,
   enum: ['energy', 'waste', 'transportation'],
   required: true 
 },
 goal: {
   type: String,
   required: true
 },
 targetReduction: {
   type: Number,
   default: 0,
   min: 0,
   max: 100
 },
 progress: {
   type: Number,
   default: 0,
   min: 0,
   max: 100
 },
 initialValue: {
   type: Number,
   default: 0
 },
 currentValue: {
   type: Number,
   default: 0
 }
});

const userSchema = new mongoose.Schema({
 userType: {
   type: String,
   enum: ['individual', 'family', 'business'],
   required: true
 },
 email: {
   type: String,  
   required: true,
   unique: true,
   trim: true,
   lowercase: true,
   match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
 },
 password: {
   type: String,
   required: true,
   minlength: 6
 },
 organizationName: {
   type: String,
   required: function() {
     return this.userType === 'business';
   }
 },
 organizationSize: {
   type: Number,
   validate: {
     validator: function(size) {
       return this.userType !== 'business' || size > 0;
     },
     message: 'Organization size must be greater than 0'
   }
 },
 familyMembers: [{
   name: {
     type: String,
     required: true
   },
   role: {
     type: String,
     required: true 
   },
   carbonEntries: [carbonEntrySchema]
 }],
 carbonEntries: [carbonEntrySchema],
 sustainabilityGoals: [sustainabilityGoalSchema],
 initialEnergyConsumption: {
   type: Number,
   default: 0,
   min: 0
 },
 initialWasteDisposal: {
   type: Number, 
   default: 0,
   min: 0
 },
 currentEnergyConsumption: {
   type: Number,
   default: 0,
   min: 0  
 },
 currentWasteDisposal: {
   type: Number,
   default: 0,
   min: 0
 },
 groups: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Group'
 }],
 resetPasswordToken: String,
 resetPasswordExpires: Date
}, {timestamps: true});

userSchema.pre('save', async function(next) {
 if (!this.isModified('password')) return next();
 try {
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
 } catch (error) {
   next(error); 
 }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
 return bcrypt.compare(candidatePassword, this.password);
};

// Calculate total carbon footprint
userSchema.methods.calculateTotalFootprint = function() {
 return this.carbonEntries.reduce((total, entry) => {
   return total + entry.totalFootprint;
 }, 0);
};

// Track progress for goals
userSchema.methods.updateGoalProgress = function() {
 this.sustainabilityGoals = this.sustainabilityGoals.map(goal => {
   if (goal.category === 'energy') {
     const reduction = ((this.initialEnergyConsumption - this.currentEnergyConsumption) / this.initialEnergyConsumption) * 100;
     goal.progress = Math.max(0, Math.min(reduction, goal.targetReduction));
   }
   if (goal.category === 'waste') {
     const reduction = ((this.initialWasteDisposal - this.currentWasteDisposal) / this.initialWasteDisposal) * 100;
     goal.progress = Math.max(0, Math.min(reduction, goal.targetReduction));
   }
   return goal;
 });
};

module.exports = mongoose.model('User', userSchema);