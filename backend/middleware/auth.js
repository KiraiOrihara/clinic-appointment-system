const authMiddleware = (req, res, next) => {
  // Patient/user session check
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'No session found, authorization denied' });
  }

  req.user = {
    id: req.session.userId,
    email: req.session.userEmail,
    role: req.session.userRole,
    firstName: req.session.userFirstName,
    lastName: req.session.userLastName
  };

  next();
};

// Admin session check (separate session keys)
const adminSessionMiddleware = (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: 'No admin session found, authorization denied' });
  }

  req.user = {
    id: req.session.adminId,
    email: req.session.adminEmail,
    role: req.session.adminRole,
    firstName: req.session.adminFirstName,
    lastName: req.session.adminLastName
  };

  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Clinic manager (or admin) role guard using admin session keys
const managerMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'clinic_manager' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Clinic manager access required' });
  }
  next();
};

// Helper function to create user session
const createSession = (req, user) => {
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.userRole = user.role;
  req.session.userFirstName = user.first_name;
  req.session.userLastName = user.last_name;
  req.session.loginTime = new Date().toISOString();
};

// Helper function to create admin session (separate from user session)
const createAdminSession = (req, user) => {
  req.session.adminId = user.id;
  req.session.adminEmail = user.email;
  req.session.adminRole = user.role;
  req.session.adminFirstName = user.first_name;
  req.session.adminLastName = user.last_name;
};

// Helper function to destroy session
const destroySession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = { 
  authMiddleware, 
  adminMiddleware, 
  adminSessionMiddleware,
  managerMiddleware,
  createSession, 
  createAdminSession,
  destroySession 
};
