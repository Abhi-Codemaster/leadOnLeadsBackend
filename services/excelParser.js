const ExcelJS = require('exceljs');
const logger = require('../utils/logger');

/**
 * Normalize header strings: lowercase, trim, camelCase
 */
const normalizeHeader = (header) => {
  if (!header) return null;
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
    .replace(/\s/g, '');
};

/**
 * Parse Plans sheet from workbook
 * Expected columns: Name, Description, Price, Currency, BillingCycle, LeadCount,
 *                   IsPopular, IsActive, SortOrder, Badge, Color,
 *                   Feature1, Feature1Included, Feature2, Feature2Included, ...
 */
const parsePlansSheet = (worksheet) => {
  const plans = [];
  const headers = [];

  worksheet.getRow(1).eachCell((cell) => {
    headers.push(normalizeHeader(cell.value));
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) rowData[header] = cell.value;
    });

    if (!rowData.name || rowData.name === null) return;

    // Parse features from dynamic columns: feature1, feature2, etc.
    const features = [];
    let i = 1;
    while (rowData[`feature${i}`] !== undefined) {
      const featureText = rowData[`feature${i}`];
      const featureIncluded = rowData[`feature${i}Included`];
      if (featureText) {
        features.push({
          text: String(featureText).trim(),
          included:
            featureIncluded === undefined || featureIncluded === true ||
            String(featureIncluded).toLowerCase() === 'yes' ||
            String(featureIncluded).toLowerCase() === 'true',
        });
      }
      i++;
    }

    const slug = String(rowData.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    plans.push({
      name: String(rowData.name).trim(),
      slug,
      description: rowData.description ? String(rowData.description).trim() : '',
      price: parseFloat(rowData.price) || 0,
      currency: rowData.currency ? String(rowData.currency).trim().toUpperCase() : 'USD',
      billingCycle: rowData.billingCycle
        ? String(rowData.billingCycle).trim().toLowerCase()
        : 'monthly',
      leadCount: parseInt(rowData.leadCount) || 0,
      features,
      isPopular:
        rowData.isPopular === true ||
        String(rowData.isPopular).toLowerCase() === 'yes' ||
        String(rowData.isPopular).toLowerCase() === 'true',
      isActive:
        rowData.isActive === undefined ||
        rowData.isActive === true ||
        String(rowData.isActive).toLowerCase() === 'yes' ||
        String(rowData.isActive).toLowerCase() === 'true',
      sortOrder: parseInt(rowData.sortOrder) || 0,
      badge: rowData.badge ? String(rowData.badge).trim() : null,
      color: rowData.color ? String(rowData.color).trim() : '#6366f1',
    });
  });

  return plans;
};

/**
 * Parse Services sheet from workbook
 * Expected columns: Title, Description, ShortDescription, Icon, Category,
 *                   Highlight1, Highlight2, ..., IsActive, SortOrder
 */
const parseServicesSheet = (worksheet) => {
  const services = [];
  const headers = [];

  worksheet.getRow(1).eachCell((cell) => {
    headers.push(normalizeHeader(cell.value));
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) rowData[header] = cell.value;
    });

    if (!rowData.title || rowData.title === null) return;

    // Parse highlights
    const highlights = [];
    let i = 1;
    while (rowData[`highlight${i}`] !== undefined) {
      if (rowData[`highlight${i}`]) {
        highlights.push(String(rowData[`highlight${i}`]).trim());
      }
      i++;
    }

    const slug = String(rowData.title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    services.push({
      title: String(rowData.title).trim(),
      slug,
      description: rowData.description ? String(rowData.description).trim() : '',
      shortDescription: rowData.shortDescription
        ? String(rowData.shortDescription).trim()
        : '',
      icon: rowData.icon ? String(rowData.icon).trim() : 'target',
      category: rowData.category ? String(rowData.category).trim() : 'General',
      highlights,
      isActive:
        rowData.isActive === undefined ||
        rowData.isActive === true ||
        String(rowData.isActive).toLowerCase() === 'yes' ||
        String(rowData.isActive).toLowerCase() === 'true',
      sortOrder: parseInt(rowData.sortOrder) || 0,
    });
  });

  return services;
};

/**
 * Main parser: accepts a file path and returns { plans, services }
 */
const parseExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const result = {
    plans: [],
    services: [],
    errors: [],
  };

  const plansSheet =
    workbook.getWorksheet('Plans') ||
    workbook.getWorksheet('plans') ||
    workbook.getWorksheet(1);

  if (plansSheet) {
    try {
      result.plans = parsePlansSheet(plansSheet);
      logger.info(`Parsed ${result.plans.length} plans from Excel`);
    } catch (err) {
      logger.error(`Error parsing Plans sheet: ${err.message}`);
      result.errors.push(`Plans sheet error: ${err.message}`);
    }
  } else {
    result.errors.push('No "Plans" sheet found in the Excel file');
  }

  const servicesSheet =
    workbook.getWorksheet('Services') || workbook.getWorksheet('services');

  if (servicesSheet) {
    try {
      result.services = parseServicesSheet(servicesSheet);
      logger.info(`Parsed ${result.services.length} services from Excel`);
    } catch (err) {
      logger.error(`Error parsing Services sheet: ${err.message}`);
      result.errors.push(`Services sheet error: ${err.message}`);
    }
  }

  return result;
};

module.exports = { parseExcelFile };
