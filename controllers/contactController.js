const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

/**
 * POST /api/contact
 */
const submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, subject, message } = req.body;

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      null;

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
    });

    logger.info(`New contact message: ${contact._id} from ${contact.email}`);

    res.status(201).json({
      success: true,
      message: 'Message received! We typically respond within 24 hours.',
      data: { id: contact._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact };
