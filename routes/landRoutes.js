const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  addProperty,
  viewAllProperties,
  viewSingleProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/landController');

// JWT Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

// Routes
router.post('/', authenticateJWT, addProperty);
router.get('/',  viewAllProperties);
router.get('/:id', viewSingleProperty);
router.put('/:id', authenticateJWT, updateProperty);
router.delete('/:id', authenticateJWT, deleteProperty);

module.exports = router;