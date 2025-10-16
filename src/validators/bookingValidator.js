const Joi = require('joi');

exports.bookingSchema = Joi.object({
  guestId: Joi.string().required().messages({
    'any.required': 'Guest ID is required'
  }),
  roomId: Joi.string().required().messages({
    'any.required': 'Room ID is required'
  }),
  checkIn: Joi.date().required().messages({
    'date.base': 'Check-in date must be valid',
    'any.required': 'Check-in date is required'
  }),
  checkOut: Joi.date().required().messages({
    'date.base': 'Check-out date must be valid',
    'any.required': 'Check-out date is required'
  }),
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed')
    .default('confirmed')
});
