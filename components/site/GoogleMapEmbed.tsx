import { site } from '@/lib/site';

/**
 * The head office on Google Maps. A keyless embed: no API key, no script on
 * the page, and the iframe only loads when it is about to scroll into view.
 */
export default function GoogleMapEmbed({ locale = 'vi', title }: { locale?: 'vi' | 'en'; title: string }) {
  const q = encodeURIComponent(site.address.mapsQuery);
  return (
    <iframe
      title={title}
      src={`https://maps.google.com/maps?q=${q}&z=16&hl=${locale}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
