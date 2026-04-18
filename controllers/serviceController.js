const Service = require('../models/Service');
const logger = require('../utils/logger');

/**
 * GET /api/services
 */
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/:slug
 */
const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getServiceBySlug };
