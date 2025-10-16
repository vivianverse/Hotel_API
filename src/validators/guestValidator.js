const Joi = require('joi');

exports.guestSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.empty': 'Guest name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'string.empty': 'Email is required',
  }),
  phone: Joi.string().allow('', null),
  room: Joi.string().optional()
});
