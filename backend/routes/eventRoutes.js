const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // Make sure this path is correct
const eventController = require("../controllers/eventController");

// Create event (protected route)
router.post("/", protect, eventController.createEvent);

// Get all events (public)
router.get("/", eventController.getEvents);

// Get single event (public)
router.get("/:id", eventController.getEventById);

module.exports = router;