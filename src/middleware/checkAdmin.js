const User = require("../models/user");

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = checkAdmin;
