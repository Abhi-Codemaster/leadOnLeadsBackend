const fs = require('fs');
const path = require('path');
const Plan = require('../models/Plan');
const Service = require('../models/Service');
const { parseExcelFile } = require('../services/excelParser');
const logger = require('../utils/logger');

/**
 * POST /api/admin/upload-excel
 * Requires admin secret header
 */
const uploadExcel = async (req, res, next) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide an Excel (.xlsx) file.',
      });
    }

    const { plans, services, errors } = await parseExcelFile(filePath);

    const results = {
      plans: { inserted: 0, updated: 0, errors: [] },
      services: { inserted: 0, updated: 0, errors: [] },
      parseErrors: errors,
    };

    // Upsert Plans
    for (const planData of plans) {
      try {
        const result = await Plan.findOneAndUpdate(
          { slug: planData.slug },
          { $set: planData },
          { upsert: true, new: true, runValidators: true }
        );
        if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
          results.plans.inserted++;
        } else {
          results.plans.updated++;
        }
      } catch (err) {
        logger.error(`Plan upsert error for "${planData.name}": ${err.message}`);
        results.plans.errors.push(`${planData.name}: ${err.message}`);
      }
    }

    // Upsert Services
    for (const serviceData of services) {
      try {
        await Service.findOneAndUpdate(
          { slug: serviceData.slug },
          { $set: serviceData },
          { upsert: true, new: true, runValidators: true }
        );
        results.services.inserted++;
      } catch (err) {
        logger.error(`Service upsert error for "${serviceData.title}": ${err.message}`);
        results.services.errors.push(`${serviceData.title}: ${err.message}`);
      }
    }

    logger.info(`Excel upload processed: ${plans.length} plans, ${services.length} services`);

    res.json({
      success: true,
      message: 'Excel file processed successfully.',
      results,
    });
  } catch (error) {
    next(error);
  } finally {
    // Always clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

/**
 * GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    const Lead = require('../models/Lead');
    const Contact = require('../models/Contact');

    const [totalLeads, newLeads, totalPlans, totalServices, totalContacts] =
      await Promise.all([
        Lead.countDocuments(),
        Lead.countDocuments({ status: 'new' }),
        Plan.countDocuments({ isActive: true }),
        Service.countDocuments({ isActive: true }),
        Contact.countDocuments({ status: 'unread' }),
      ]);

    res.json({
      success: true,
      data: {
        leads: { total: totalLeads, new: newLeads },
        plans: { active: totalPlans },
        services: { active: totalServices },
        contacts: { unread: totalContacts },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadExcel, getStats };
