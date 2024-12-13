const adminAuth = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Bu işlem için yetkiniz bulunmamaktadır' 
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminAuth; 