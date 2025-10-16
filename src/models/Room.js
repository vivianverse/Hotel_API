
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['single', 'double', 'suite'], default: 'single' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'unavailable'], default: 'available' }
}, { timestamps: true });


roomSchema.pre('remove', async function (next) {
  const Booking = mongoose.model('Booking');
  await Booking.deleteMany({ room: this._id });
  next();
});


// Check if model is already compiled, if not, define it
module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
