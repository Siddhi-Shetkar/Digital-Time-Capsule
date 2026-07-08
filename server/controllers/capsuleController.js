const Capsule = require('../models/Capsule');

// Create a new capsule
exports.createCapsule = async (req, res) => {
  try {
    const { title, description, message, category, unlockDate, status, media, mood, tags } = req.body;
    
    const capsule = await Capsule.create({
      title,
      description,
      message,
      category,
      unlockDate,
      status: status || 'draft',
      mood: mood || 'Neutral',
      tags: tags || [],
      author: req.user._id,
      media: media || [] // Accept media from body for seeding/testing
    });

    res.status(201).json(capsule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating capsule' });
  }
};

// Get user's capsules
exports.getMyCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(capsules);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching capsules' });
  }
};

// Get public gallery capsules
exports.getPublicCapsules = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { status: 'public' };

    // Search
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by Category
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Filter by Mood
    if (req.query.mood && req.query.mood !== 'All') {
      query.mood = req.query.mood;
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // Default Newest
    if (req.query.sort === 'Oldest') sortObj = { createdAt: 1 };
    // Most liked sorting would require aggregation or sorting by array length, 
    // Mongoose doesn't natively sort by array length in standard queries without aggregation,
    // so if sort === 'Most Liked', we can sort after fetch or use a likesCount field.
    // Given the simplicity, let's fetch and sort in memory if needed, or stick to date sorting.
    // Actually, we can add a simple sort logic.

    const capsules = await Capsule.find(query)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name')
      .sort(sortObj)
      .skip(startIndex)
      .limit(limit);

    // If Most liked, sort in memory for now (fine for small scale)
    if (req.query.sort === 'Most Liked') {
      capsules.sort((a, b) => b.likes.length - a.likes.length);
    }

    const total = await Capsule.countDocuments(query);

    res.json({
      success: true,
      count: capsules.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: capsules
    });
  } catch (error) {
    console.error('Error fetching public gallery', error);
    res.status(500).json({ message: 'Server error fetching public gallery' });
  }
};

// Get single capsule details
exports.getCapsuleById = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id).populate('author', 'name');
    
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check permissions
    if (capsule.author._id.toString() !== req.user._id.toString()) {
      if (capsule.status !== 'public') {
        return res.status(403).json({ message: 'Not authorized to view this capsule' });
      }
    }

    res.json(capsule);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching capsule' });
  }
};

// Helper function to check capsule permissions
const getCapsuleIfAuthorized = async (id, userId) => {
  const capsule = await Capsule.findById(id);
  if (!capsule) throw new Error('Capsule not found');
  if (capsule.author.toString() !== userId.toString()) throw new Error('Not authorized');
  return capsule;
};

// Lock Capsule
exports.lockCapsule = async (req, res) => {
  try {
    const { unlockDate } = req.body;
    const capsule = await getCapsuleIfAuthorized(req.params.id, req.user._id);

    if (!['draft', 'public', 'private'].includes(capsule.status)) {
      return res.status(400).json({ message: `Cannot lock a capsule in ${capsule.status} state` });
    }

    if (!unlockDate) {
      return res.status(400).json({ message: 'Unlock date is required to lock a capsule' });
    }

    capsule.status = 'locked';
    capsule.unlockDate = new Date(unlockDate);
    await capsule.save();

    res.json(capsule);
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ message: error.message || 'Server error' });
  }
};

// Unlock Capsule
exports.unlockCapsule = async (req, res) => {
  try {
    const capsule = await getCapsuleIfAuthorized(req.params.id, req.user._id);

    if (capsule.status !== 'locked') {
      return res.status(400).json({ message: 'Only locked capsules can be unlocked' });
    }

    if (new Date() < new Date(capsule.unlockDate)) {
      return res.status(400).json({ message: 'Cannot unlock before the unlock date' });
    }

    capsule.status = 'unlocked';
    await capsule.save();

    res.json(capsule);
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ message: error.message || 'Server error' });
  }
};

// Make Public
exports.makePublic = async (req, res) => {
  try {
    const capsule = await getCapsuleIfAuthorized(req.params.id, req.user._id);

    if (!['draft', 'private', 'unlocked'].includes(capsule.status)) {
      return res.status(400).json({ message: `Cannot make public from ${capsule.status} state` });
    }

    capsule.status = 'public';
    await capsule.save();

    res.json(capsule);
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ message: error.message || 'Server error' });
  }
};

// Make Private
exports.makePrivate = async (req, res) => {
  try {
    const capsule = await getCapsuleIfAuthorized(req.params.id, req.user._id);

    if (!['draft', 'public', 'unlocked'].includes(capsule.status)) {
      return res.status(400).json({ message: `Cannot make private from ${capsule.status} state` });
    }

    capsule.status = 'private';
    await capsule.save();

    res.json(capsule);
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ message: error.message || 'Server error' });
  }
};

// Delete Capsule
exports.deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (capsule.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await capsule.deleteOne();
    res.json({ message: 'Capsule deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting capsule' });
  }
};

// Like/Unlike Capsule
exports.likeCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' });

    // Ensure only public or owned capsules can be liked (or unlocked etc.)
    if (capsule.status !== 'public' && capsule.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const index = capsule.likes.indexOf(req.user._id);
    if (index === -1) {
      capsule.likes.push(req.user._id); // Like
    } else {
      capsule.likes.splice(index, 1); // Unlike
    }

    await capsule.save();
    res.json(capsule.likes);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating likes' });
  }
};

// Add Comment
exports.commentCapsule = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' });

    if (capsule.status !== 'public' && capsule.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newComment = {
      user: req.user._id,
      text
    };

    capsule.comments.unshift(newComment); // Add to beginning
    await capsule.save();

    const populatedCapsule = await Capsule.findById(req.params.id).populate('comments.user', 'name avatar');
    res.json(populatedCapsule.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding comment' });
  }
};
