import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

/**
 * Booking requests land here and go out on every channel that is configured:
 *
 *   RESEND_API_KEY + LEAD_FROM_ADDRESS   email to LEAD_TO_ADDRESS (default sales4@hth.com.vn)
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  a message in the dispatch group
 *   LEAD_WEBHOOK_URL                      JSON POST (Google Sheets script, Zapier, Make, n8n…)
 *
 * `delivered` is true when at least one channel accepted the request. With none
 * configured the booking module falls back to pre-filled Zalo, WhatsApp and
 * mail links, so a lead is never silently swallowed.
 */

const MAX_MESSAGE = 4000;
const MAX_FIELD = 300;

/** Bots fill hidden fields and submit within a second of page load. */
const MIN_FILL_MS = 2500;

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 6;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 2000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanFields(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, 30)) {
    if (/^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(key)) {
      const v = typeof raw === 'number' || typeof raw === 'boolean' ? String(raw) : text(raw, MAX_FIELD);
      if (v) out[key] = v;
    }
  }
  return out;
}

type Channel = () => Promise<void>;

function channels(summary: string, message: string, fields: Record<string, string>): Channel[] {
  const list: Channel[] = [];

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.LEAD_FROM_ADDRESS;
  if (apiKey && sender) {
    list.push(async () => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: sender,
          to: [process.env.LEAD_TO_ADDRESS || site.email],
          subject: `Đặt xe: ${summary}`,
          text: message,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`resend ${response.status}: ${await response.text()}`);
    });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    list.push(async () => {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`telegram ${response.status}: ${await response.text()}`);
    });
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    list.push(async () => {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedAt: new Date().toISOString(), summary, message, ...fields }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`webhook ${response.status}`);
    });
  }

  return list;
}

export async function POST(request: Request) {
  // Same-origin only. Browsers always send Origin on a cross-site POST.
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ delivered: false, error: 'forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ delivered: false, error: 'forbidden' }, { status: 403 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ delivered: false, error: 'bad-request' }, { status: 400 });
  }

  const summary = text(body.summary, 400);
  const message = text(body.message, MAX_MESSAGE);
  const fields = cleanFields(body.fields);

  if (!summary || !message) {
    return NextResponse.json({ delivered: false, error: 'bad-request' }, { status: 400 });
  }

  // Spam: answer as if accepted so the bot learns nothing, but send nothing.
  const elapsed = typeof body.elapsed === 'number' ? body.elapsed : Infinity;
  if (text(body.company, 200) || elapsed < MIN_FILL_MS) {
    console.warn('[lead] dropped as spam');
    return NextResponse.json({ delivered: true });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) {
    return NextResponse.json({ delivered: false, reason: 'rate-limited' }, { status: 429 });
  }

  const configured = channels(summary, message, fields);
  if (configured.length === 0) {
    console.warn('[lead] no delivery channel configured, falling back to direct messaging');
    return NextResponse.json({ delivered: false, reason: 'not-configured' });
  }

  const results = await Promise.allSettled(configured.map((send) => send()));
  results.forEach((result) => {
    if (result.status === 'rejected') console.error('[lead] channel failed', result.reason);
  });

  const delivered = results.some((result) => result.status === 'fulfilled');
  return NextResponse.json(delivered ? { delivered: true } : { delivered: false, reason: 'provider-error' });
}
