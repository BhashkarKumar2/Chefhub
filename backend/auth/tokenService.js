import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const TOKEN_TTL = '1d';
const ALGORITHM = 'HS256';

export class AuthTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthTokenError';
  }
}

// `tv` ties the token to the user's tokenVersion so a password change or
// reset signs out every existing session.
export const signAuthToken = (user) => jwt.sign(
  { id: user._id.toString(), tv: user.tokenVersion || 0 },
  process.env.JWT_SECRET,
  { expiresIn: TOKEN_TTL, algorithm: ALGORITHM }
);

// Verifies signature, expiry and session version, and returns the user.
// Throws jsonwebtoken errors (TokenExpiredError / JsonWebTokenError) or AuthTokenError.
export const verifyAuthToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [ALGORITHM] });

  const user = await User.findById(decoded.id).select('+tokenVersion');
  if (!user) {
    throw new AuthTokenError('User not found');
  }

  // Tokens issued before tokenVersion existed carry no `tv` and count as version 0
  if ((decoded.tv || 0) !== (user.tokenVersion || 0)) {
    throw new AuthTokenError('Session has been revoked');
  }

  return user;
};
