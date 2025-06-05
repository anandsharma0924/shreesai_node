const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");

const client = new OAuth2Client(
  "290076810108-hmb0b6gipqv5jd3acet375m05huqmrqg.apps.googleusercontent.com"
);

exports.register = async (req, res) => {
  const { username, email, password, googleId, name, googleToken } = req.body;

  try {
    if (googleId && googleToken && email && name) {
      // Handle Google signup
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience:
          "290076810108-hmb0b6gipqv5jd3acet375m05huqmrqg.apps.googleusercontent.com",
      });
      const payload = ticket.getPayload();

      if (payload.sub !== googleId) {
        return res.status(401).json({ error: "Invalid Google token" });
      }

      let user = await User.findOne({ where: { googleId } });
      if (user) {
        return res
          .status(400)
          .json({ error: "Google account already registered" });
      }

      // Check if email is already used
      user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create new user with Google data, including profile picture
      user = await User.create({
        username: name,
        email,
        googleId,
        profilePicture: payload.picture, // Save Google profile picture
      });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
      );

      return res.status(201).json({
        message: "User registered successfully with Google",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture,
        },
      });
    } else if (username && email && password) {
      // Handle email/password signup (unchanged)
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture || null,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
      );

      return res.status(201).json({
        message: "registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture || null,
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid registration request" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ error: "Error registering user", details: error });
  }
};

exports.login = async (req, res) => {
  const { email, password, googleId, name, googleToken } = req.body;

  try {
    if (googleId && googleToken && email && name) {
      // Handle Google login
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience:
          "139761323520-pvud9icj7rnuplas6c2cfdfs2k55d7k3.apps.googleusercontent.com",
      });
      const payload = ticket.getPayload();

      if (payload.sub !== googleId) {
        return res.status(401).json({ error: "Invalid Google token" });
      }

      let user = await User.findOne({ where: { googleId } });

      if (!user) {
        // If user doesn't exist, create a new one (auto-register)
        user = await User.create({
          username: name,
          email,
          googleId,
          profilePicture: payload.picture,
        });
      } else {
        // Update profile picture if it has changed
        if (user.profilePicture !== payload.picture) {
          user.profilePicture = payload.picture;
          await user.save();
        }
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
      );

      return res.status(200).json({
        message: "Google login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture,
        },
      });
    } else if (email && password) {
      // Handle email/password login
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.password) {
        return res
          .status(401)
          .json({ error: "Account registered with Google. Use Google login." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture || null,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          picture: user.profilePicture || null,
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid login request" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in", details: error });
  }
};
