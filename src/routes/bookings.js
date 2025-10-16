
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingsController');
// const auth = require('../middlewares/auth');
const { bookingSchema } = require('../validators/bookingValidator');

// ========================================================================================
//  Testing Without Authentication

// Validation middleware
function validateBooking(req, res, next) {
  const { error } = bookingSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}

// Public CRUD routes (no auth)
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', validateBooking, ctrl.create);
router.put('/:id', validateBooking, ctrl.update);
router.delete('/:id', ctrl.delete);

// Relationship: list bookings by guest
router.get('/guest/:id', ctrl.listByGuest);

module.exports = router;

