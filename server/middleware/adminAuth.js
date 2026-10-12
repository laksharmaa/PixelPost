import { expressjwt } from 'express-jwt';

const verifyAdminToken = expressjwt({
  secret: process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key',
  algorithms: ['HS256']
});

export default verifyAdminToken;