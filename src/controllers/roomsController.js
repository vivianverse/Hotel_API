const Room = require('../models/Room');
const Booking = require('../models/Booking');

// List rooms with pagination, filters, availability check, and search
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      search
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const query = {};

    // Filter by status/type
    if (status) query.status = status;
    if (type) query.type = type;

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by room number (partial match)
    if (search) {
      query.number = { $regex: search, $options: 'i' }; // case-insensitive
    }

    // Step 1: Get base rooms list
    let rooms = await Room.find(query)
      .sort({ createdAt: -1 });

    // Step 2: Filter by availability if checkIn & checkOut provided
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Find room IDs with overlapping bookings
      const bookedRoomIds = await Booking.find({
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ]
      }).distinct('room');

      // Filter out booked rooms from result
      rooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
    }

    // Step 3: Apply pagination after filtering (especially important after availability filtering)
    const total = rooms.length;
    const paginatedRooms = rooms.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

    // Final response
    res.json({
      data: paginatedRooms,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific room by ID
exports.get = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create logic can handle both single and bulk/multiple room creation
exports.create = async (req, res) => {
  try {
    const roomsData = req.body;

    if (Array.isArray(roomsData)) {
     
      // Validate each room before it added
      for (const room of roomsData) {
        if (!room.number || !room.price) {
          return res.status(400).json({ error: 'Each room must have number and price' });
        }
      }

      // Check for room duplicates
      const existingNumbers = await Room.find({ number: { $in: roomsData.map(r => r.number) } });
      if (existingNumbers.length > 0) {
        return res.status(400).json({
          error: 'Some room numbers already exist',
          duplicates: existingNumbers.map(r => r.number)
        });
      }

      const createdRooms = await Room.insertMany(roomsData);
      return res.status(201).json({ message: 'Rooms added successfully', data: createdRooms });
    }

    // Add single room
    const { number, type, price, status } = req.body;
    if (!number || !price) return res.status(400).json({ error: 'number and price are required' });

    const existing = await Room.findOne({ number });
    if (existing) return res.status(400).json({ error: 'Room number already exists' });

    const room = await Room.create({ number, type, price, status });
    res.status(201).json(room);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update logic can handle both single and bulk room updates
exports.update = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete logic for a room by ID
exports.delete = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// List available rooms for a given date range
exports.listAvailable = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut dates are required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const booked = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
        { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } }
      ]
    }).distinct('room');

    const availableRooms = await Room.find({
      _id: { $nin: booked },
      status: { $ne: 'unavailable' }
    });

    res.json({ data: availableRooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};