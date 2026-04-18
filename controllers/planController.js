const { validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const logger = require('../utils/logger');

/**
 * GET /api/plans
 */
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/plans/:slug
 */
const getPlanBySlug = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ slug: req.params.slug, isActive: true }).lean();

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, getPlanBySlug };
