const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  resource_type: { type: String, required: true } // image, video, raw (pdf)
});

const capsuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Personal', 'Birthday', 'Graduation', 'Family', 'Friends', 'Career', 'Future Goals', 'Love', 'Travel', 'Memories', 'Custom'],
    default: 'Personal'
  },
  unlockDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'locked', 'unlocked', 'public', 'private'],
    default: 'draft'
  },
  mood: {
    type: String,
    default: 'Neutral'
  },
  tags: [{
    type: String,
    trim: true
  }],
  media: [mediaSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Ensure virtuals are included in JSON output
capsuleSchema.set('toJSON', { virtuals: true });
capsuleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Capsule', capsuleSchema);
