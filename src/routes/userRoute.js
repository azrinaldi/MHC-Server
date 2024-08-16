const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")

const verifyToken = require('../middleware/verifyToken');
//Admin
router.get("/getAllUsers", verifyToken, userController.getAllUsers);


//User
router.get("/getUserName", verifyToken, userController.getUserName);

router.get("/getUserProfile", verifyToken, userController.getUserProfile);   

router.put("/updateProfile", verifyToken, userController.updateProfile);


module.exports = router; 