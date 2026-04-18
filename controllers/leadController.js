const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

/**
 * POST /api/leads
 * Public - No auth required
 */
const createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { firstName, lastName, email, mobileNumber, source } = req.body;

    // Check for duplicate email (soft - allow resubmission but flag it)
    const existingLead = await Lead.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      // Still return success to prevent email enumeration
      logger.info(`Duplicate lead submission for email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Your request has been received! Our team will reach out shortly with your 100 free leads.',
        data: { alreadyExists: true },
      });
    }

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      null;

    const lead = await Lead.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber?.trim() || null,
      source: source || 'hero_cta',
      ipAddress,
    });

    logger.info(`New lead created: ${lead._id} - ${lead.email}`);

    res.status(201).json({
      success: true,
      message: 'Success! Your 100 free leads are on the way. Check your inbox shortly.',
      data: {
        id: lead._id,
        email: lead.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads
 * Admin only
 */
const getLeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = status ? { status } : {};

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-ipAddress'),
      Lead.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLead, getLeads };
