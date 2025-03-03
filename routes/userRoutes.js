const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/singleUser", userController.getSingleUser);
router.get("/allUsers", userController.getAllUsers);
router.post("/add-guardian", userController.addGuardian);
router.post("/delete-guardian", userController.deleteGuardian);
router.post("/update-location", userController.updateLocation);

module.exports = router;
