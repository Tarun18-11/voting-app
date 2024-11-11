import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET || '', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};
