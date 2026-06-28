const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { hashPassword, comparePassword, signToken } = require('../utils/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function verifyGoogleToken(idToken) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return null;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

function buildUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture || '',
    authProvider: user.authProvider,
  };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail }).exec();
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local',
    });

    const token = signToken({ id: user._id, email: user.email });
    res.status(201).json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).exec();
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: user._id, email: user.email });
    res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken, name, email, picture } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ message: 'Google authentication data is required' });
    }

    const verifiedPayload = await verifyGoogleToken(idToken);
    const verifiedEmail = verifiedPayload?.email || email;
    const verifiedName = verifiedPayload?.name || name;
    const verifiedPicture = verifiedPayload?.picture || picture;

    if (!verifiedEmail) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    const normalizedEmail = normalizeEmail(verifiedEmail);
    let user = await User.findOne({ email: normalizedEmail }).exec();

    if (!user) {
      user = await User.create({
        name: verifiedName?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        picture: verifiedPicture || '',
        googleId: verifiedPayload?.sub || idToken,
        authProvider: 'google',
      });
    } else if (!user.googleId) {
      user.googleId = verifiedPayload?.sub || idToken;
      user.authProvider = 'google';
      user.picture = verifiedPicture || user.picture || '';
      await user.save();
    }

    const token = signToken({ id: user._id, email: user.email });
    res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};
