const express = require('express');
const router = express.Router();
const testController = require("../controllers/testContoller")

const verifyToken = require('../middleware/verifyToken');

router.get("/getQuestions", verifyToken, testController.getQuestions)

router.post("/saveScreeningDASS42", verifyToken, testController.saveScreeningDASS42)

module.exports = router; 