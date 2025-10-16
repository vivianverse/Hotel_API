const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// CRUD operations for bookings
// Also handle room status updates based on bookings
async function recomputeRoomOccupancy(roomId) {
  const now = new Date();
  const active = await Booking.findOne({
    room: roomId,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lte: now },
    checkOut: { $gt: now }
  });
  const room = await Room.findById(roomId);
  if (!room) return;
  room.status = active ? 'occupied' : 'available';
  await room.save();
}

// List, Get, Create, Update, Delete, List by Guest
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10, guestId, roomId } = req.query;
    const query = {};
    if (guestId) query.guest = guestId;
    if (roomId) query.room = roomId;

    const bookings = await Booking.find(query)
      .populate('guest')
      .populate('room')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);
    res.json({ data: bookings, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get booking by ID
exports.get = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('guest').populate('room');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// create booking with validation and room availability check
// exports.create = async (req, res) => {
//   try {
//     const { guestId, roomId, checkIn, checkOut } = req.body;
//     if (!guestId || !roomId || !checkIn || !checkOut) {
//       return res.status(400).json({ error: 'guestId, roomId, checkIn and checkOut are required' });
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);
//     if (isNaN(checkInDate) || isNaN(checkOutDate)) {
//       return res.status(400).json({ error: 'Invalid dates' });
//     }
//     if (checkInDate >= checkOutDate) {
//       return res.status(400).json({ error: 'checkOut must be after checkIn' });
//     }

//     const guest = await Guest.findById(guestId);
//     if (!guest) return res.status(404).json({ error: 'Guest not found' });

//     const room = await Room.findById(roomId);
//     if (!room) return res.status(404).json({ error: 'Room not found' });

//     const existing = await Booking.find({
//       room: roomId,
//       status: { $in: ['pending', 'confirmed'] }
//     });

//     const overlap = existing.some(b => !(b.checkOut <= checkInDate || b.checkIn >= checkOutDate));
//     if (overlap) return res.status(400).json({ error: 'Room is already booked for that date range' });

//     const booking = await Booking.create({
//       guest: guestId,
//       room: roomId,
//       checkIn: checkInDate,
//       checkOut: checkOutDate,
//       status: 'confirmed'
//     });

//     const now = new Date();
//     if (now >= checkInDate && now < checkOutDate) {
//       room.status = 'occupied';
//       await room.save();
//     }

//     res.status(201).json(await booking.populate('guest').populate('room'));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// create booking with validation and room availability check
exports.create = async (req, res) => {
  try {
    const { guestId, roomId, checkIn, checkOut } = req.body;

    if (!guestId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'guestId, roomId, checkIn and checkOut are required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ error: 'Invalid dates' });
    }
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: 'checkOut must be after checkIn' });
    }

    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Check for overlapping bookings
    const existing = await Booking.find({
      room: roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Room is already booked for that date range' });
    }

    // Create booking
    const booking = await Booking.create({
      guest: guestId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: 'confirmed'
    });

    // Update room status if applicable
    const now = new Date();
    if (now >= checkInDate && now < checkOutDate) {
      room.status = 'occupied';
      await room.save();
    }

    // Populate guest and room using findById (ensures populate() works)
    const populatedBooking = await Booking.findById(booking._id)
      .populate('guest')
      .populate('room');

    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update booking with validation and room availability check
exports.update = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (req.body.checkIn) booking.checkIn = new Date(req.body.checkIn);
    if (req.body.checkOut) booking.checkOut = new Date(req.body.checkOut);
    if (req.body.status) booking.status = req.body.status;

   const existing = await Booking.find({
      _id: { $ne: booking._id },
      room: booking.room,
      status: { $in: ['pending', 'confirmed'] }
    });

    const overlap = existing.some(b => !(b.checkOut <= booking.checkIn || b.checkIn >= booking.checkOut));
    if (overlap) return res.status(400).json({ error: 'Updated dates overlap with another booking' });

    await booking.save();
    await recomputeRoomOccupancy(booking.room);
    res.json(await booking.populate('guest').populate('room'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete booking and update room status if needed
exports.delete = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await recomputeRoomOccupancy(booking.room);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bookings by guest ID 
exports.listByGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ guest: id }).populate('room');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
