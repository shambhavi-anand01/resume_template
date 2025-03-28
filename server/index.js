const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors(
  {
    origin: ["http://localhost:5173", "https://resume-template-navy.vercel.app"], // Replace '*' with the frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers)
  }
)); // Enable CORS

// Import Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes); // Mount auth routes

// Start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
