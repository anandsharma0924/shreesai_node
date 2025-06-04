require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sequelize = require("./models/index");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const numberRoutes = require("./routes/numberRoutes");
require("dotenv").config();

const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/numbers", numberRoutes);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error syncing database:", err);
  });
