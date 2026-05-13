import { Request, Response, NextFunction } from 'express';

/**
 * RSK-003 / T-046: IP whitelist middleware.
 * Reads a comma-separated list of allowed IPv4/IPv6 addresses from the
 * IP_WHITELIST environment variable and blocks any request whose source
 * IP is not on the list with HTTP 403.
 *
 * If IP_WHITELIST is empty or not set, all requests are allowed (open mode).
 *
 * Usage:
 *   app.use('/api/v1/admin', ipWhitelist, adminRouter);
 */
export const ipWhitelist = (req: Request, res: Response, next: NextFunction): void => {
  const whitelistEnv = process.env.IP_WHITELIST ?? '';

  // No whitelist configured → allow all traffic
  if (!whitelistEnv.trim()) {
    next();
    return;
  }

  const allowedIps = whitelistEnv
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  // Resolve client IP — strip IPv4-mapped IPv6 prefix (::ffff:)
  const raw = req.ip ?? req.socket.remoteAddress ?? '';
  const clientIp = raw.replace(/^::ffff:/, '');

  if (!allowedIps.includes(clientIp)) {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado: IP no autorizada',
    });
    return;
  }

  next();
};
