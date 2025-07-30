import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {

  if (req.method === 'GET' && req.originalUrl.startsWith('/api/profile/')) {
    return next();
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorize = (roles) => (req, res, next) => {
  // Convert single role to array for consistency
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Forbidden',
      debug: {
        requiredRoles: allowedRoles,
        userRole: req.user.role
      }
    });
  }
  next();
};