/**
 * Simple admin secret-based auth
 * For production, replace with JWT or session-based auth
 */
const adminAuth = (req, res, next) => {
  const secret =
    req.headers['x-admin-secret'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Valid admin credentials required.',
    });
  }

  next();
};

module.exports = adminAuth;
