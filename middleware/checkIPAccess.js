// middleware/checkIpAccess.js
// Middleware to verify that the current user's IP is allowed
// to access a specific Service based on IPRecord entries.

const { requireAuth, requireRole } = require('../middleware/auth');

const { IPRecord, Service } = require('../database/models');

function ipToInt(ip) {
  return (
    ip
      .split('.')
      .map(Number)
      .reduce((acc, num) => (acc << 8) + num, 0) >>> 0
  );
}

function isInRange(ip, range) {
  const [subnet, prefixLength] = range.split('/');
  const ipNum = ipToInt(ip);
  const subnetNum = ipToInt(subnet);
  const mask = (-1 << (32 - Number(prefixLength))) >>> 0;
  return (ipNum & mask) === (subnetNum & mask);
}

async function checkIpAccess(req, res, next) {
  try {
    const rawIpHeader = req.headers['x-forwarded-for'] || req.ip || '';
    const clientIp = rawIpHeader.split(',')[0].trim();

    if (!clientIp) {
      return res
        .status(400)
        .json({ error: 'Unable to determine client IP address' });
    }

    const serviceId = req.params.id || req.params.serviceId || req.body.serviceId;

    if (!serviceId) {
      return res.status(400).json({ error: 'serviceId is required' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const records = await IPRecord.findAll({
      where: {
        ServiceId: service.id,
        UserId: req.user.id,
      },
    });

    if (!records || records.length === 0) {
      return res.status(403).json({
        error:
          'Access denied: no IP records found for this user and service',
        ip: clientIp,
      });
    }

    let allowed = false;

    for (const record of records) {
      const range = record.ipAddress; // adjust if your column name differs
      if (!range) continue;

      if (range.includes('/')) {
        if (isInRange(clientIp, range)) {
          allowed = true;
          break;
        }
      } else if (range === clientIp) {
        allowed = true;
        break;
      }
    }

    if (!allowed) {
      return res.status(403).json({
        error: 'Access denied: this IP is not approved for the requested service',
        ip: clientIp,
      });
    }

    req.clientIp = clientIp;
    req.service = service;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkIpAccess;