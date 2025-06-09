const { Op } = require('sequelize');
const Property = require('../models/lands');
const upload = require('../utils/multer');
const path = require('path');
const fs = require('fs');

// Input Validation
const validatePropertyInput = (req) => {
  const { title, category, transactionType, price, location, city, state, status } = req.body;
  const errors = [];

  if (!title) errors.push('Title is required');
  if (!category || !['Land', 'Commercial', 'Industrial', 'Investment', 'Residential'].includes(category)) {
    errors.push('Invalid or missing category');
  }
  if (!transactionType || !['Sell', 'Buy', 'Rent'].includes(transactionType)) {
    errors.push('Invalid or missing transaction type');
  }
  if (!price || isNaN(price) || price <= 0) errors.push('Price must be a positive number');
  if (!location) errors.push('Location is required');
  if (!city) errors.push('City is required');
  if (!state) errors.push('State is required');
  if (!status || !['Available', 'Sold', 'Under Offer', 'Rented', 'Pending'].includes(status)) {
    errors.push('Invalid or missing status');
  }

  return errors;
};

// Add Property
exports.addProperty = [
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const errors = validatePropertyInput(req);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const {
        title, description, category, transactionType, price, location, city, state, pincode,
        area, plotSize, bedrooms, bathrooms, buildingType, investmentType, propertyAge,
        floorNumber, totalFloors, parking, furnishedStatus, amenities, status
      } = req.body;

      // Handle file uploads
      const imageUrls = req.files && req.files.images
        ? req.files.images.map(file => `/uploads/${file.filename}`)
        : [];
      const videoUrl = req.files && req.files.video
        ? `/uploads/${req.files.video[0].filename}`
        : req.body.videoUrl || null;

      const property = await Property.create({
        title,
        description,
        category,
        transactionType,
        price: parseFloat(price),
        location,
        city,
        state,
        pincode,
        area: area ? parseFloat(area) : null,
        plotSize: plotSize ? parseFloat(plotSize) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        buildingType,
        investmentType,
        propertyAge: propertyAge ? parseInt(propertyAge) : null,
        floorNumber: floorNumber ? parseInt(floorNumber) : null,
        totalFloors: totalFloors ? parseInt(totalFloors) : null,
        parking: parking === 'true',
        furnishedStatus,
        videoUrl,
        imageUrls,
        amenities: amenities ? JSON.parse(amenities) : [],
        status
      });

      res.status(201).json({ message: 'Land Property created successfully', property });
    } catch (error) {
      console.error('Error adding property:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
        });
      }
      if (error.message.includes('multer')) {
        return res.status(400).json({ error: 'File upload error', details: error.message });
      }
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
];

// View All Properties (with filters)
exports.viewAllProperties = async (req, res) => {
  try {
    const {
      category, transactionType, minPrice, maxPrice, city, state, pincode, status,
      bedrooms, bathrooms, buildingType, investmentType, furnishedStatus
    } = req.query;

    const where = {};

    if (category) where.category = category;
    if (transactionType) where.transactionType = transactionType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (state) where.state = { [Op.like]: `%${state}%` };
    if (pincode) where.pincode = pincode;
    if (status) where.status = status;
    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (bathrooms) where.bathrooms = parseInt(bathrooms);
    if (buildingType) where.buildingType = buildingType;
    if (investmentType) where.investmentType = investmentType;
    if (furnishedStatus) where.furnishedStatus = furnishedStatus;

    if (req.query.amenities) {
      try {
        const amenities = JSON.parse(req.query.amenities);
        if (Array.isArray(amenities)) {
          where.amenities = { [Op.contains]: amenities };
        } else {
          return res.status(400).json({ error: 'Amenities must be an array' });
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid amenities format' });
      }
    }

    const properties = await Property.findAll({ where });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// View Single Property
exports.viewSingleProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Update Property
exports.updateProperty = [
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const errors = validatePropertyInput(req);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const {
        title, description, category, transactionType, price, location, city, state, pincode,
        area, plotSize, bedrooms, bathrooms, buildingType, investmentType, propertyAge,
        floorNumber, totalFloors, parking, furnishedStatus, amenities, status
      } = req.body;

      // Handle file uploads
      const imageUrls = req.files && req.files.images
        ? req.files.images.map(file => `/uploads/${file.filename}`)
        : req.body.imageUrls ? JSON.parse(req.body.imageUrls) : property.imageUrls;
      const videoUrl = req.files && req.files.video
        ? `/uploads/${req.files.video[0].filename}`
        : req.body.videoUrl || property.videoUrl;

      // Delete old files if new ones are uploaded
      if (req.files && req.files.images && property.imageUrls) {
        property.imageUrls.forEach(filePath => {
          const fullPath = path.join(__dirname, '..', filePath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
      }
      if (req.files && req.files.video && property.videoUrl) {
        const fullPath = path.join(__dirname, '..', property.videoUrl);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }

      await property.update({
        title,
        description,
        category,
        transactionType,
        price: parseFloat(price),
        location,
        city,
        state,
        pincode,
        area: area ? parseFloat(area) : null,
        plotSize: plotSize ? parseFloat(plotSize) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        buildingType,
        investmentType,
        propertyAge: propertyAge ? parseInt(propertyAge) : null,
        floorNumber: floorNumber ? parseInt(floorNumber) : null,
        totalFloors: totalFloors ? parseInt(totalFloors) : null,
        parking: parking === 'true',
        furnishedStatus,
        videoUrl,
        imageUrls,
        amenities: amenities ? JSON.parse(amenities) : [],
        status
      });

      res.json({ message: 'Property updated successfully', property });
    } catch (error) {
      console.error('Error updating property:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
        });
      }
      if (error.message.includes('multer')) {
        return res.status(400).json({ error: 'File upload error', details: error.message });
      }
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
];

// Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Delete associated files
    if (property.imageUrls) {
      property.imageUrls.forEach(filePath => {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    if (property.videoUrl) {
      const fullPath = path.join(__dirname, '..', property.videoUrl);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await property.destroy();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};