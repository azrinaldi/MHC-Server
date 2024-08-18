const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")

const verifyToken = require('../middleware/verifyToken');
//Admin
router.get("/getAllUsers", verifyToken, userController.getAllUsers);

router.post("/addNewUser", verifyToken, userController.addNewUser);

router.delete("/deleteUser/:id", verifyToken, userController.deleteUser);

//User
router.get("/getUserName", verifyToken, userController.getUserName);

router.get("/getUserProfile", verifyToken, userController.getUserProfile);   

router.put("/updateProfile", verifyToken, userController.updateProfile);


module.exports = router; 