import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Infrastructure Service: JWT token generation and verification.
 * - Access Token: 15 minutes (short-lived, for API authorization)
 * - Refresh Token: 7 days (long-lived, for token renewal)
 */
export class JwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error(
        'JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables',
      );
    }

    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
  }

  /**
   * Generates both access and refresh tokens for an authenticated user.
   */
  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId: payload.userId }, this.refreshSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verifies an access token and returns its decoded payload.
   * Throws if the token is invalid or expired.
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessSecret) as TokenPayload;
  }

  /**
   * Verifies a refresh token and returns the userId from its payload.
   * Throws if the token is invalid or expired.
   */
  verifyRefreshToken(token: string): { userId: number } {
    return jwt.verify(token, this.refreshSecret) as { userId: number };
  }
}
