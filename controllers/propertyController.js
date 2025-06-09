const Property = require("../models/property");
const upload = require("../utils/multer");

exports.addProperty = [
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        location,
        size,
        features,
        propertyType,
        status,
        category,
      } = req.body;

      if (
        !title ||
        !description ||
        !price ||
        !location ||
        !size ||
        !propertyType ||
        !status ||
        !category
      ) {
        return res.status(400).json({
          error: "Missing required fields",
          missing: {
            title,
            description,
            price,
            location,
            size,
            propertyType,
            status,
            category,
          },
        });
      }

      // Validate price and size
      const parsedPrice = parseInt(price, 10);
      const parsedSize = parseInt(size, 15);
      if (isNaN(parsedPrice) || isNaN(parsedSize)) {
        return res
          .status(400)
          .json({ error: "Price and size must be valid numbers", price, size });
      }

      // Validate ENUM fields
      const validPropertyTypes = ["sale", "rent"];
      const validStatuses = ["available", "sold", "pending"];
      const validCategories = ["PG", "Hostel", "Room", "Villa", "Home"];
      if (!validPropertyTypes.includes(propertyType)) {
        return res.status(400).json({
          error: `Invalid propertyType. Must be one of: ${validPropertyTypes.join(
            ", "
          )}`,
          propertyType,
        });
      }
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          status,
        });
      }
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(
            ", "
          )}`,
          category,
        });
      }

      // Parse features
      let parsedFeatures = [];
      if (features) {
        try {
          parsedFeatures = features
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        } catch (err) {
          return res
            .status(400)
            .json({ error: "Invalid features format", features });
        }
      }

      const image = req.files["images"]
        ? req.files["images"].map((file) => file.path)
        : [];
      const video = req.files["video"] ? req.files["video"][0].path : null;

      const images = image.map(
        (imgPath) => "https://shreesai-node.onrender.com" + imgPath
      );

      const property = await Property.create({
        title,
        description,
        price: parsedPrice,
        location,
        size: parsedSize,
        features: parsedFeatures,
        propertyType,
        status,
        category,
        images,
        video,
      });

      return res.status(201).json(property);
    } catch (error) {
      console.error("Error adding property:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => e.message),
        });
      }
      if (error.message.includes("multer")) {
        return res
          .status(400)
          .json({ error: "File upload error", details: error });
      }
      return res
        .status(500)
        .json({ error: "Internal server error", details: error });
    }
  },
];

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Failed to fetch property", details: error });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: error });
  }
};
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Error fetching properties" });
  }
};

exports.getProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findByPk(id);
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Error fetching property", details: error });
  }
};

exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findByPk(id);
    if (!property) return res.status(404).json({ error: "Property not found" });
    await property.destroy();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting property" });
  }
};
