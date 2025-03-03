const mongoose = require("mongoose");

const guardianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Guardian = mongoose.model("Guardian", guardianSchema);
module.exports = Guardian;
