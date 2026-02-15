const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  organizer: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Business', 'Arts', 'Sports', 'Music', 'Education', 'Other']
  },
  tags: [{
    type: String
  }],
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Text search index
eventSchema.index({ eventName: 'text', description: 'text', organizer: 'text' });

module.exports = mongoose.model("Event", eventSchema);