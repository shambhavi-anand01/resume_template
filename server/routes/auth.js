const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret"; // Fallback for JWT_SECRET

// 🌟 **Debugging Route**
router.get("/", (req, res) => {
  res.send("Auth route is working!");
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Fetch User Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 🟢 **User Signup Route**
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("userType").isIn(["fresher", "working"]).withMessage("User type must be 'fresher' or 'working'"),
  ],
  async (req, res) => {
    console.log("Signup Request Body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, userType } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      // 🔒 Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 🔹 Save New User
      user = new User({ name, email, password: hashedPassword, userType });
      await user.save();

      // 🔹 Generate JWT Token
      const token = jwt.sign({ id: user.id, userType }, JWT_SECRET, { expiresIn: "1h" });

      res.json({ token, user: { id: user.id, name, email, userType } });
    } catch (err) {
      console.error("Signup Error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// 🔵 **User Login Route**
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    console.log("Login Request Body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

      // 🔹 Generate JWT Token
      const token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET, { expiresIn: "1h" });

      res.json({ token, user: { id: user.id, name: user.name, email, userType: user.userType } });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// 🔴 **Get User Profile (Protected)**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password field
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;





// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const router = express.Router();

// // Signup Route
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password, userType } = req.body;

//     // Validate input
//     if (!name || !email || !password || !userType) {
//       return res.status(400).json({ msg: "All fields are required" });
//     }

//     // Check if user exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Save user to DB
//     user = new User({ name, email, password: hashedPassword, userType });
//     await user.save();

//     // Return response
//     res.status(201).json({ msg: "User registered successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// // Login Route
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ msg: "All fields are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: "Invalid credentials" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid credentials" });
//     }

//     // Generate JWT
//     const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ token, userType: user.userType });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// module.exports = router;

