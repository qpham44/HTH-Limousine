'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  fare,
  formatDuration,
  formatVnd,
  legFor,
  matchPlace,
  places,
  typicalMinutes,
  type Place,
  type VehicleKey,
} from '@/lib/quote';
import { fleet } from '@/data/fleet';
import { site } from '@/lib/site';
import { t, type Locale } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import InView from '@/components/site/InView';
import styles from './BookingModule.module.css';

const QuoteMap = dynamic(() => import('./QuoteMap'), { ssr: false });

interface Sent {
  summary: string;
  message: string;
  delivered: boolean;
}

interface Located {
  label: string;
  full: string;
  lat: number;
  lng: number;
}

/** Local calendar date, not UTC: in Vietnam the two disagree until 07:00. */
function localIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function phoneDigits(value: string): number {
  return value.replace(/\D/g, '').length;
}

/**
 * A typed place resolves first against HTH's own list, then — only if that
 * fails — against the map geocoder, debounced so it runs once the customer
 * pauses rather than on every keystroke.
 */
function useResolvedPlace(text: string) {
  const q = text.trim();
  const local = useMemo(() => matchPlace(q), [q]);
  const [found, setFound] = useState<Record<string, (Place & { full: string }) | null>>({});
  const known = q in found;

  useEffect(() => {
    if (local || q.length < 4 || known) return;
    let cancelled = false;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      let place: (Place & { full: string }) | null = null;
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const json = response.ok ? ((await response.json()) as { place: Located | null }) : null;
        const hit = json?.place;
        if (hit) {
          place = {
            id: `geo:${hit.lat.toFixed(4)},${hit.lng.toFixed(4)}`,
            vi: hit.label,
            en: hit.label,
            full: hit.full,
            lat: hit.lat,
            lng: hit.lng,
            kw: [],
            approx: true,
          };
        }
      } catch {
        if (cancelled) return;
      }
      if (cancelled) return;
      setFound((prev) => ({ ...prev, [q]: place }));
    }, 650);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, local, known]);

  const place: (Place & { full?: string }) | null = local ?? found[q] ?? null;
  return { place, searching: !local && !known && q.length >= 4 };
}

export default function BookingModule({
  locale = 'vi',
  variant = 'panel',
}: {
  locale?: Locale;
  /** 'overlay' sits the module as glass over a photograph, e.g. the homepage hero. */
  variant?: 'panel' | 'overlay';
}) {
  const copy = t(locale).booking;
  const en = locale === 'en';

  const [service, setService] = useState<string>(copy.services[0].id);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [vehicle, setVehicle] = useState<VehicleKey>('auto');
  const [roundTrip, setRoundTrip] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [route, setRoute] = useState<{ key: string; km: number; minutes: number; path: [number, number][] } | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const mountedAt = useRef(0);
  const trackedKey = useRef('');

  useEffect(() => {
    mountedAt.current = Date.now();
    setMinDate(localIso(new Date()));
  }, []);

  /* A destination chosen elsewhere (the journey map, or ?to= on the booking
     page) arrives as the drop-off. The customer still checks and sends it. */
  useEffect(() => {
    const vehicleKeys = ['bmw', 'carnival', 'transit16', 'transitdcar', 'solati', 'bus45'];
    const applyExtras = (pax?: number, vehicle?: string, round?: boolean) => {
      if (vehicle && vehicleKeys.includes(vehicle)) setVehicle(vehicle as VehicleKey);
      if (typeof round === 'boolean') setRoundTrip(round);
      if (pax && pax > 0) {
        // The passenger field is uncontrolled; set it once the form is rendered.
        window.requestAnimationFrame(() => {
          const input = formRef.current?.querySelector<HTMLInputElement>('input[name="pax"]');
          if (input) input.value = String(Math.min(Math.round(pax), 47));
        });
      }
    };
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
      setDropoff(to.slice(0, 120));
      applyExtras(Number(params.get('pax')) || undefined, params.get('xe') ?? undefined);
    }
    const onPrefill = (e: Event) => {
      const detail = (e as CustomEvent<{ dropoff?: string; pax?: number; vehicle?: string; roundTrip?: boolean }>).detail;
      if (detail?.dropoff) {
        setSent(null);
        setDropoff(detail.dropoff.slice(0, 120));
        applyExtras(detail.pax, detail.vehicle, detail.roundTrip);
      }
    };
    window.addEventListener('hth:prefill', onPrefill);
    return () => window.removeEventListener('hth:prefill', onPrefill);
  }, []);

  const origin = useResolvedPlace(pickup);
  const destination = useResolvedPlace(dropoff);
  const from = origin.place;
  const to = destination.place;
  const searching = origin.searching || destination.searching;
  const sameArea = Boolean(from && to && from.id === to.id);

  /* Live road route from OSRM, with the measured table as the fallback. */
  useEffect(() => {
    if (!from || !to || sameArea) { setRoute(null); return; }
    const key = `${from.id}|${to.id}`;
    if (route?.key === key) return;

    const controller = new AbortController();
    const url =
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}` +
      '?overview=full&geometries=geojson';

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        const found = json?.routes?.[0];
        if (!found) throw new Error('no route');
        const km = Math.round(found.distance / 1000);
        setRoute({
          key,
          km,
          minutes: Math.max(Math.round(found.duration / 60), typicalMinutes(km)),
          path: found.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]),
        });
      })
      .catch(() => { /* the measured table covers it */ });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, sameArea]);

  /* Distance, drive time and the indicative band. */
  const estimate = useMemo(() => {
    if (!from || !to) return null;
    const approx = Boolean(from.approx || to.approx);
    if (sameArea) {
      return { km: null, minutes: null, band: fare(0, vehicle, roundTrip), measured: false, live: false, approx, sameArea: true };
    }
    const live = route?.key === `${from.id}|${to.id}` ? route : null;
    const table = legFor(from, to);
    // HTH's own measured pairs win; the router only fills the gaps.
    const useLive = live !== null && !table.measured;
    const km = useLive ? live!.km : table.km;
    const minutes = useLive ? live!.minutes : table.minutes;
    const band = fare(km, vehicle, roundTrip);
    return { km, minutes, band, measured: table.measured, live: useLive, approx, sameArea: false };
  }, [from, to, sameArea, route, vehicle, roundTrip]);

  useEffect(() => {
    if (!estimate || !from || !to) return;
    const key = `${from.id}|${to.id}`;
    if (trackedKey.current === key) return;
    trackedKey.current = key;
    track('quote_generated', { from: from.id.startsWith('geo:') ? 'address' : from.id, to: to.id.startsWith('geo:') ? 'address' : to.id });
  }, [estimate, from, to]);

  const status = searching
    ? copy.statusSearching
    : estimate
      ? estimate.sameArea
        ? copy.statusSameArea
        : estimate.measured
          ? copy.statusMeasured
          : estimate.approx
            ? copy.statusApprox
            : estimate.live
              ? copy.statusRoad
              : copy.statusEstimate
      : (pickup + dropoff).trim().length > 2
        ? copy.statusUnknownPlace
        : copy.statusRegion;

  const vehicleName = useCallback(
    (key: VehicleKey) => {
      const fallback = en ? 'a car we recommend' : 'xe do HTH đề xuất';
      if (key === 'auto') return fallback;
      const found = fleet.find((v) => v.key === key);
      if (!found) return fallback;
      return en ? found.nameEn : found.name;
    },
    [en],
  );

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (sending) return;
      const data = new FormData(event.currentTarget);
      const get = (name: string) => String(data.get(name) ?? '').trim();

      const date = get('date');
      const time = get('time');
      if (!date || !time) {
        setError(copy.missingDateTime);
        return;
      }
      const [y, m, d] = date.split('-').map(Number);
      const [hh, mm] = time.split(':').map(Number);
      if (new Date(y, m - 1, d, hh, mm).getTime() < Date.now() - 5 * 60_000) {
        setError(copy.pastTime);
        return;
      }
      const digits = phoneDigits(get('phone'));
      if (digits < 9 || digits > 15) {
        setError(copy.invalidPhone);
        return;
      }

      const L = copy.messageLabels;
      const serviceLabel = copy.services.find((s) => s.id === service)?.label ?? '';
      const located = (typed: string, place: typeof from) =>
        place?.approx && place.full ? `${typed} (${L.located}: ${place.full})` : typed;
      const leg = `${get('pickup')}${get('dropoff') ? ` → ${get('dropoff')}` : ''}`;
      const when = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} ${time}`;
      const trip = roundTrip ? L.roundTrip : L.oneWay;
      const pax = get('pax');
      const estimateText = estimate
        ? `${estimate.km !== null ? `${estimate.km} km · ` : ''}${formatVnd(estimate.band.low, locale)} – ${formatVnd(estimate.band.high, locale)}₫`
        : '';

      const summary = `${serviceLabel} · ${leg} · ${when} · ${pax} ${en ? 'pax' : 'khách'} · ${trip.toLowerCase()}`;

      const lines = [
        copy.messageHeading,
        `${L.service}: ${serviceLabel}`,
        `${L.pickup}: ${located(get('pickup'), from)}`,
        get('dropoff') ? `${L.dropoff}: ${located(get('dropoff'), to)}` : '',
        `${L.when}: ${when}`,
        `${L.passengers}: ${pax} · ${trip}`,
        `${L.vehicle}: ${vehicleName(vehicle)}`,
        estimateText ? `${L.estimate}: ${estimateText}` : '',
        `${L.customer}: ${get('name')} · ${get('phone')}`,
        get('note') ? `${L.note}: ${get('note')}` : '',
      ].filter(Boolean);

      const message = lines.join('\n');

      setSending(true);
      setError('');
      let delivered = false;
      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary,
            message,
            company: get('company'),
            elapsed: Date.now() - mountedAt.current,
            fields: {
              locale,
              service: serviceLabel,
              pickup: get('pickup'),
              dropoff: get('dropoff'),
              date,
              time,
              passengers: pax,
              trip,
              vehicle: vehicleName(vehicle),
              estimate: estimateText,
              name: get('name'),
              phone: get('phone'),
              note: get('note'),
              page: window.location.pathname,
            },
          }),
        });
        delivered = response.ok && (await response.json())?.delivered === true;
      } catch {
        delivered = false;
      }

      track('booking_submitted', { service, vehicle, round_trip: roundTrip, delivered, locale });

      setSending(false);
      setSent({ summary, message, delivered });
    },
    [sending, service, roundTrip, vehicle, estimate, vehicleName, copy, en, locale, from, to],
  );

  const waHref = sent ? `${site.phone.whatsapp}?text=${encodeURIComponent(sent.message)}` : site.phone.whatsapp;
  const mailHref = sent
    ? `mailto:${site.email}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(sent.message)}`
    : `mailto:${site.email}`;

  const listId = `hth-places-${locale}`;

  return (
    <div className={`${styles.module} ${variant === 'overlay' ? styles.overlay : ''}`} id="dat-xe">
      <div className={styles.grid}>
        <div className={styles.form}>
          <div className={styles.head}>
            <h2 className={styles.title}>{copy.title}</h2>
            <span className={styles.headNote}>{copy.note}</span>
          </div>

          {sent ? (
            <div className={styles.sent} role="status">
              <div className={styles.sentTop}>
                <span className={styles.tick} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="m4.5 10.5 3.8 3.8L15.5 6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <div className="stack stack-10">
                  <h3>{sent.delivered ? copy.sentTitle : copy.sentTitleFallback}</h3>
                  <p className="u-quiet" style={{ fontSize: 15 }}>
                    {sent.delivered ? copy.sentDelivered : copy.sentFallback}
                  </p>
                </div>
              </div>

              <p className={styles.sentSummary}>{sent.summary}</p>

              <div className={styles.sentActions}>
                <a href={site.phone.zalo} target="_blank" rel="noopener" className="btn btn--gold">
                  {copy.sendZalo}
                </a>
                <a href={waHref} target="_blank" rel="noopener" className="btn btn--outline">WhatsApp</a>
                <a href={mailHref} className="btn btn--outline">{copy.email}</a>
                <a href={`tel:${site.phone.tel}`} className="btn btn--outline">
                  {t(locale).callAction} {site.phone.display}
                </a>
              </div>

              <button
                type="button"
                className="tlink"
                onClick={() => { setSent(null); formRef.current?.reset(); }}
              >
                {copy.newRequest}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.tabs} role="group" aria-label={copy.serviceGroup}>
                {copy.services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={styles.tab}
                    aria-pressed={service === s.id}
                    onClick={() => setService(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <form ref={formRef} onSubmit={onSubmit}>
                <datalist id={listId}>
                  {places.map((p) => (
                    <option key={p.id} value={en ? p.en : p.vi} />
                  ))}
                </datalist>

                {/* Hidden from people; bots fill it in. */}
                <div className={styles.trap} aria-hidden="true">
                  <label>
                    Company
                    <input name="company" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.c2}`}>
                    <span className="label">{copy.pickup}</span>
                    <input
                      name="pickup"
                      required
                      maxLength={160}
                      list={listId}
                      autoComplete="off"
                      placeholder={copy.pickupPlaceholder}
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.c2}`}>
                    <span className="label">{copy.dropoff}</span>
                    <input
                      name="dropoff"
                      maxLength={160}
                      list={listId}
                      autoComplete="off"
                      placeholder={copy.dropoffPlaceholder}
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.c1}`}>
                    <span className="label">{copy.date}</span>
                    <input name="date" type="date" required min={minDate} />
                  </label>
                  <label className={`${styles.field} ${styles.c1}`}>
                    <span className="label">{copy.time}</span>
                    <input name="time" type="time" required step={300} />
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.c1}`}>
                    <span className="label">{copy.passengers}</span>
                    <input name="pax" type="number" inputMode="numeric" min={1} max={47} defaultValue={2} required />
                  </label>
                  <label className={`${styles.field} ${styles.c2}`}>
                    <span className="label">{copy.vehicle}</span>
                    <select
                      name="vehicle"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value as VehicleKey)}
                    >
                      <option value="auto">{copy.vehicleAuto}</option>
                      {fleet.map((v) => (
                        <option key={v.key} value={v.key}>
                          {en ? v.nameEn : v.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.c1}`}>
                    <span className="label">{copy.trip}</span>
                    <select
                      name="trip"
                      value={roundTrip ? 'round' : 'one'}
                      onChange={(e) => setRoundTrip(e.target.value === 'round')}
                    >
                      <option value="one">{copy.oneWay}</option>
                      <option value="round">{copy.roundTrip}</option>
                    </select>
                  </label>
                  <label className={`${styles.field} ${styles.c2}`}>
                    <span className="label">{copy.phone}</span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      maxLength={24}
                      placeholder={copy.phonePlaceholder}
                    />
                  </label>
                </div>

                <div className={`${styles.row} ${styles.row3}`}>
                  <label className={`${styles.field} ${styles.c2}`}>
                    <span className="label">{copy.name}</span>
                    <input name="name" required maxLength={80} autoComplete="name" placeholder={copy.namePlaceholder} />
                  </label>
                  <label className={`${styles.field} ${styles.c2}`}>
                    <span className="label">{copy.note2}</span>
                    <input name="note" maxLength={300} placeholder={copy.notePlaceholder} />
                  </label>
                  <div className={`${styles.submitCell} ${styles.c2}`}>
                    <button type="submit" className="btn btn--gold" disabled={sending} aria-busy={sending}>
                      {sending ? copy.sending : copy.submit}
                    </button>
                  </div>
                </div>

                {error ? <p className={styles.error} role="alert">{error}</p> : null}
                <p className={styles.consent}>{copy.consent}</p>
              </form>
            </>
          )}
        </div>

        <aside className={styles.aside} aria-label={copy.routeAndQuote}>
          <div className={styles.asideHead}>
            <span className="label">{copy.routeAndQuote}</span>
            <span className={styles.status} aria-live="polite">{status}</span>
          </div>

          <div className={styles.mapBox}>
            <InView>
              <QuoteMap
                from={from}
                to={to}
                path={route?.key === `${from?.id}|${to?.id}` ? route.path : null}
                locale={locale}
              />
            </InView>
            {!estimate ? (
              <div className={styles.mapHint}>
                <p>{copy.mapHint}</p>
              </div>
            ) : null}
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>{copy.distance}</div>
              <div className={styles.metricValue}>
                {estimate ? (estimate.km !== null ? `${estimate.km} km` : copy.sameAreaShort) : '—'}
              </div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>{copy.driveTime}</div>
              <div className={styles.metricValue}>
                {estimate?.minutes != null ? formatDuration(estimate.minutes, locale) : '—'}
              </div>
            </div>
          </div>

          <div aria-live="polite">
            <div className="label" style={{ marginBottom: 7 }}>{copy.estimate}</div>
            <div className={styles.quoteValue}>
              {estimate
                ? `${formatVnd(estimate.band.low, locale)} – ${formatVnd(estimate.band.high, locale)}₫`
                : '—'}
            </div>
            <p className={styles.quoteNote}>
              {estimate
                ? `${copy.quoteNoteSuffix(vehicleName(vehicle), roundTrip)}${
                    estimate.sameArea ? ` ${copy.sameAreaNote}` : estimate.approx ? ` ${copy.approxNote}` : ''
                  }`
                : copy.quoteNoteEmpty}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
