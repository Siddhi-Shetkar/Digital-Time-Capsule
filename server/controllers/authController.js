const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  console.log('[BACKEND] /api/auth/register hit');
  console.log('[BACKEND] Incoming payload:', { name: req.body.name, email: req.body.email, password: '***' });
  
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    console.log('[BACKEND] Checking for existing user with email:', email);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn('[BACKEND] Validation Failed: User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    console.log('[BACKEND] Creating new user in MongoDB and hashing password...');
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log('[BACKEND] User created successfully! ID:', user._id);

    if (user) {
      console.log('[BACKEND] Generating JWT Token for new user');
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
      console.log('[BACKEND] Response 201 Created sent to client');
    } else {
      console.warn('[BACKEND] User object not returned from MongoDB');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('[BACKEND FATAL ERROR in register]:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  console.log('[BACKEND] /api/auth/login hit');
  console.log('[BACKEND] Incoming payload:', { email: req.body.email, password: '***' });
  
  try {
    const { email, password } = req.body;

    // Check for user
    console.log('[BACKEND] Looking up user by email...');
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      console.log('[BACKEND] Login successful, generating JWT Token');
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
      console.log('[BACKEND] Response 200 OK sent to client');
    } else {
      console.warn('[BACKEND] Validation Failed: Invalid email or password');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[BACKEND FATAL ERROR in login]:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
