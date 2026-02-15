const Event = require("../models/Event");
const User = require("../models/User");

// Get all events with search, filter, pagination
exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Text search (flexible query)
    if (req.query.search) {
      query.$or = [
        { eventName: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { organizer: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date filter
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    const total = await Event.countDocuments(query);

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
      hasMore: page * limit < total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single event with full details
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      availableSeats: req.body.capacity,
      createdBy: req.user
    };

    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check available seats
    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // Check if already registered
    if (event.registeredUsers.includes(req.user)) {
      return res.status(400).json({ message: "Already registered" });
    }

    // Check if event date has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Cannot register for past events" });
    }

    // Register user
    event.registeredUsers.push(req.user);
    event.availableSeats -= 1;
    await event.save();

    // Update user's registered events
    await User.findByIdAndUpdate(req.user, {
      $push: { registeredEvents: event._id }
    });

    res.json({ message: "Successfully registered", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if registered
    if (!event.registeredUsers.includes(req.user)) {
      return res.status(400).json({ message: "Not registered for this event" });
    }

    // Cancel registration
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.toString()
    );
    event.availableSeats += 1;
    await event.save();

    // Update user
    await User.findByIdAndUpdate(req.user, {
      $pull: { registeredEvents: event._id }
    });

    res.json({ message: "Registration cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Dashboard - Get my registered events
exports.getMyEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .populate({
        path: 'registeredEvents',
        populate: { path: 'createdBy', select: 'name email' }
      });

    const now = new Date();
    
    // Separate upcoming and past events
    const upcomingEvents = user.registeredEvents.filter(
      event => new Date(event.date) >= now
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const pastEvents = user.registeredEvents.filter(
      event => new Date(event.date) < now
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      upcomingEvents,
      pastEvents,
      totalRegistered: user.registeredEvents.length,
      upcomingCount: upcomingEvents.length,
      pastCount: pastEvents.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Event (admin/creator only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is creator
    if (event.createdBy.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};