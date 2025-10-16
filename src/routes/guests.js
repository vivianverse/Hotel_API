
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/guestsController');
const bookingsCtrl = require('../controllers/bookingsController');
// const auth = require('../middlewares/auth');
const { guestSchema } = require('../validators/guestValidator');

// ========================================================================================
//  Testing Without Authentication

// Validation middleware
function validateGuest(req, res, next) {
  const { error } = guestSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}

// Public CRUD routes (no auth)
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', validateGuest, ctrl.create);
router.put('/:id', validateGuest, ctrl.update);
router.delete('/:id', ctrl.delete);

// Relationship: get bookings by guest
router.get('/:id/bookings', bookingsCtrl.listByGuest);

module.exports = router;
