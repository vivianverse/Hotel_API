const Guest = require('../models/Guest');


// List all guests with pagination
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const guests = await Guest.find()
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('room');
    const total = await Guest.countDocuments();
    res.json({ data: guests, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific guest by ID
exports.get = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('room');
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new guest
exports.create = async (req, res) => {
  try {
    const { name, email, phone, room } = req.body;
    const exist = await Guest.findOne({ email });
    if (exist) return res.status(400).json({ error: 'Guest with this email already exists' });
    const guest = await Guest.create({ name, email, phone, room });
    res.status(201).json(guest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing guest by ID
exports.update = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a guest by ID
exports.delete = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
