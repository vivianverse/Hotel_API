
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guestSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Guest || mongoose.model('Guest', guestSchema);
