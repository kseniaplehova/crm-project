const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "No data about profile" });
    }
    const userRole = req.user.role;

    if (roles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  };
};

module.exports = roleMiddleware;
