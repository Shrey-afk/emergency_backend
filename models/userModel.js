const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    guardians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guardian",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
