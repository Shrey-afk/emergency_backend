const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://shreyproject4:somesh2004@cluster0.x4zxd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to database!!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
