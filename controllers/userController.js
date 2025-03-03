const User = require("../models/userModel");
const Guardian = require("../models/guardianModel");
const bcrypt = require("bcryptjs");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      latitude,
      longitude,
    });
    await user.save();

    res
      .status(201)
      .json({ message: "User registered successfully", success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).populate("guardians");
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("guardians");
    return res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Guardian
exports.addGuardian = async (req, res) => {
  try {
    const { userId, name, email, relationship } = req.body;

    // Create guardian
    const guardian = new Guardian({ name, email, relationship });
    await guardian.save();

    // Update user with new guardian
    await User.findByIdAndUpdate(
      userId,
      { $push: { guardians: guardian._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Guardian added successfully",
      guardian,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Guardian
exports.deleteGuardian = async (req, res) => {
  try {
    const { userId, guardianId } = req.body;

    // Remove guardian from user
    await User.findByIdAndUpdate(
      userId,
      { $pull: { guardians: guardianId } },
      { new: true }
    );

    // Delete guardian from database
    await Guardian.findByIdAndDelete(guardianId);

    res.status(200).json({ message: "Guardian deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { userID, latitude, longitude } = req.body;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    user.latitude = latitude;
    user.longitude = longitude;
    await user.save();

    return res.status(202).json({
      message: "Successfully saved location",
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    return res.status(200).send(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
