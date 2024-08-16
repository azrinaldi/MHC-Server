//scheduleRoute.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

const verifyToken = require('../middleware/verifyToken');
const checkExpired = require('../middleware/expiredCheck');
const checkAdmin = require('../middleware/checkAdmin');

router.get("/getScheduleByDate/:date", checkExpired, verifyToken, scheduleController.getScheduleByDate);

//Klien
router.get('/bookedSchedule', checkExpired, verifyToken, scheduleController.bookedSchedule);
router.post('/scheduleAppointment', checkExpired, verifyToken, scheduleController.scheduleAppointment);
router.post('/cancelAppointment', verifyToken, scheduleController.cancelAppointment)

//Admin
router.post("/addNewSchedule", verifyToken, scheduleController.addNewSchedule);
router.put("/updateSchedule/:id",  verifyToken, scheduleController.updateSchedule);
router.delete("/deleteSchedule/:id",  verifyToken, scheduleController.deleteSchedule);

router.get("/getClients",  verifyToken, scheduleController.getClients);

//Psikolog
router.get("/activeBooked", verifyToken, scheduleController.activeBooked)



module.exports = router;
