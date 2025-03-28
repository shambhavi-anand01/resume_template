const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["fresher", "working"], required: true }, // Fresher or Working Professional
});

module.exports = mongoose.model("User", UserSchema);
