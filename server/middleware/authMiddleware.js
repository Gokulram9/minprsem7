const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        return next(new Error('Session invalid: User account not found in database. Please log in again.'));
      }
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Session expired or invalid authentication token. Please log in again.')); 
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Authentication required: Please log in to perform this action.')); 
  }
};

module.exports = { protect };
