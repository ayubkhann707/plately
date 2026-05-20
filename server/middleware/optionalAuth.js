const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
  } catch {
    // invalid token, just continue without user
  }

  next();
};