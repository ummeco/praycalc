import { Router } from 'express';
import { optionalAuth, type AuthRequest } from '../middleware/auth.js';
import { calculatePrayerTimes, type CalcMethod, type Madhab } from '../lib/prayer-calculator.js';

export const prayerTimesRouter = Router();

const VALID_METHODS: CalcMethod[] = ['isna', 'mwl', 'egypt', 'umm_al_qura', 'tehran', 'karachi'];
const VALID_MADHABS: Madhab[] = ['shafii', 'hanafi'];

prayerTimesRouter.get('/', optionalAuth, (req: AuthRequest, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const method = ((req.query.method as string) || 'isna').toLowerCase() as CalcMethod;
  const madhab = ((req.query.madhab as string) || 'shafii').toLowerCase() as Madhab;

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({
      error: 'Invalid coordinates',
      message: 'lat must be -90..90, lng must be -180..180',
    });
    return;
  }

  // Validate date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({
      error: 'Invalid date format',
      message: 'date must be YYYY-MM-DD',
    });
    return;
  }

  // Validate method
  if (!VALID_METHODS.includes(method)) {
    res.status(400).json({
      error: 'Invalid calculation method',
      message: `method must be one of: ${VALID_METHODS.join(', ')}`,
    });
    return;
  }

  // Validate madhab
  if (!VALID_MADHABS.includes(madhab)) {
    res.status(400).json({
      error: 'Invalid madhab',
      message: `madhab must be one of: ${VALID_MADHABS.join(', ')}`,
    });
    return;
  }

  const result = calculatePrayerTimes(lat, lng, dateStr, method, madhab);

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(result);
});
