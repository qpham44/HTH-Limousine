/**
 * Conversion events, switched off until HTH has a GA4 property.
 *
 * Nothing loads and nothing is sent unless NEXT_PUBLIC_GA_ID is set, so the
 * site currently ships with no third-party script and no cookie banner, which
 * is what HTH asked for. When the property exists, set the variable in Vercel
 * and these four events start recording without any code change.
 *
 * Only meaningful actions are tracked. Page views come from GA4 itself.
 */

export type ConversionEvent =
  | 'booking_submitted'
  | 'quote_generated'
  | 'hotline_tapped'
  | 'zalo_tapped'
  | 'destination_opened'
  | 'destination_book_clicked';

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export function track(event: ConversionEvent, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', event, params);
  } catch {
    // Analytics must never break a booking.
  }
}

export const gaId = process.env.NEXT_PUBLIC_GA_ID ?? '';
