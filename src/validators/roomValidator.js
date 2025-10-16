const Joi = require('joi');

exports.roomSchema = Joi.object({
  number: Joi.string().required().messages({
    'string.empty': 'Room number is required'
  }),
  type: Joi.string().valid('single', 'double', 'suite').default('single'),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'any.required': 'Price is required'
  }),
  status: Joi.string().valid('available', 'occupied', 'unavailable').default('available')
});
