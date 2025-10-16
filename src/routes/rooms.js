const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roomsController');
// const auth = require('../middlewares/auth');
const { roomSchema } = require('../validators/roomValidator');

// ========================================================================================
//  Testing Without Authentication 

// Validation middleware
function validateRoom(req, res, next) {
  const { error } = roomSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}

// Public CRUD routes (no auth)
router.get('/', ctrl.list);
router.get('/available', ctrl.listAvailable);
router.get('/:id', ctrl.get);
router.post('/', validateRoom, ctrl.create);
router.put('/:id', validateRoom, ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
