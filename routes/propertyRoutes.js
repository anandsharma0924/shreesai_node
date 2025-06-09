const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, propertyController.addProperty);

router.get('/', propertyController.getProperties);   // /api/properties

router.get('/:id', propertyController.getProperty);

router.delete('/:id', authMiddleware, propertyController.deleteProperty);

module.exports = router;
