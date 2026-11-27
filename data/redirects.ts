/**
 * 301 map from the old Joomla site to this one.
 *
 * hth.com.vn has roughly fourteen years of indexed URLs. Losing them is the
 * single largest risk in this project, so this map must be filled in and
 * deployed BEFORE the new site goes live, not after.
 *
 * Rules:
 *  - One hop only. Never point an old URL at another old URL.
 *  - `permanent: true` emits a 301. Use it for everything here.
 *  - Old URLs look like `/gioi-thieu-xe-hth-transit-dcar-limousine-7-cho.html`.
 *  - A page with no clear equivalent goes to the nearest useful page, not to `/`.
 *    Sending everything to the home page throws away most of the link equity.
 *
 * To fill this in: export the old URL list (Screaming Frog, the Joomla sitemap,
 * or Search Console's Pages report), then add one entry per URL below.
 *
 * TODO — awaiting the URL export from HTH. See TODO.md.
 */

export interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export const legacyRedirects: Redirect[] = [
  // Example of the shape, commented out until the real list arrives:
  // { source: '/gioi-thieu-xe-hth-transit-dcar-limousine-7-cho.html',
  //   destination: '/doi-xe/ford-transit-dcar-limousine', permanent: true },
];

/** Guard against the two mistakes that quietly destroy a migration. */
export function validateRedirects(list: Redirect[]): string[] {
  const problems: string[] = [];
  const sources = new Set<string>();
  const destinations = new Set(list.map((r) => r.destination));

  for (const entry of list) {
    if (sources.has(entry.source)) problems.push(`duplicate source: ${entry.source}`);
    sources.add(entry.source);

    if (entry.source === entry.destination) problems.push(`points at itself: ${entry.source}`);

    // A destination that is also a source means a visitor takes two hops.
    if (sources.has(entry.destination) || destinations.has(entry.source)) {
      problems.push(`redirect chain via: ${entry.source}`);
    }
  }
  return problems;
}
