const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected: Add property
router.post('/', authMiddleware, propertyController.addProperty);

// Public: Get all properties
router.get('/', propertyController.getProperties);

// Public: Get property by ID
router.get('/:id', propertyController.getProperty);

// Protected: Delete property
router.delete('/:id', authMiddleware, propertyController.deleteProperty);

module.exports = router;
