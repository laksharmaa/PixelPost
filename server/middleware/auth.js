import 'dotenv/config';
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';

const auth0Domain = process.env.AUTH0_DOMAIN;

const checkJwt = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${auth0Domain}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${auth0Domain}/`,
  algorithms: ['RS256'],
  requestProperty: 'auth'
});

export default checkJwt;