import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function attachUser(req, res, next) {
  try {
    req.user = await User.findById(req.userId).populate('favoriteTeam', 'name');
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
