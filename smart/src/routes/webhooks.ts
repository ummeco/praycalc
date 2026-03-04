import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const webhookRouter = Router();

// In-memory store (production: use database via Hasura GraphQL)
const registrations = new Map<string, WebhookRegistration[]>();

interface WebhookRegistration {
  id: string;
  userId: string;
  callbackUrl: string;
  lat: number;
  lng: number;
  events: string[];
  active: boolean;
  createdAt: string;
}

const MAX_WEBHOOKS_PER_USER = 5;

/** POST /api/v1/webhooks — Register a webhook callback. */
webhookRouter.post('/', requireAuth, (req: AuthRequest, res) => {
  const { callbackUrl, lat, lng, events } = req.body;
  const userId = req.userId!;

  if (!callbackUrl || typeof callbackUrl !== 'string') {
    res.status(400).json({ error: 'callbackUrl is required' });
    return;
  }

  try {
    new URL(callbackUrl);
  } catch {
    res.status(400).json({ error: 'callbackUrl must be a valid URL' });
    return;
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Valid lat (-90..90) and lng (-180..180) required' });
    return;
  }

  const validEvents = ['adhan', 'iqamah'];
  const eventList = Array.isArray(events) ? events.filter((e: string) => validEvents.includes(e)) : ['adhan'];

  const userRegs = registrations.get(userId) || [];
  if (userRegs.length >= MAX_WEBHOOKS_PER_USER) {
    res.status(409).json({
      error: 'Maximum webhooks reached',
      message: `Maximum ${MAX_WEBHOOKS_PER_USER} webhooks per user`,
    });
    return;
  }

  const registration: WebhookRegistration = {
    id: crypto.randomUUID(),
    userId,
    callbackUrl,
    lat,
    lng,
    events: eventList,
    active: true,
    createdAt: new Date().toISOString(),
  };

  userRegs.push(registration);
  registrations.set(userId, userRegs);

  res.status(201).json(registration);
});

/** GET /api/v1/webhooks — List user's webhook registrations. */
webhookRouter.get('/', requireAuth, (req: AuthRequest, res) => {
  const userRegs = registrations.get(req.userId!) || [];
  res.json({ webhooks: userRegs.filter(r => r.active) });
});

/** DELETE /api/v1/webhooks/:id — Remove a webhook. */
webhookRouter.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const userRegs = registrations.get(req.userId!) || [];
  const idx = userRegs.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }
  userRegs.splice(idx, 1);
  registrations.set(req.userId!, userRegs);
  res.status(204).send();
});

/** Get all active registrations (for cron to fire). */
export function getAllActiveRegistrations(): WebhookRegistration[] {
  const all: WebhookRegistration[] = [];
  for (const regs of registrations.values()) {
    all.push(...regs.filter(r => r.active));
  }
  return all;
}
