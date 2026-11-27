import Script from 'next/script';
import { gaId } from '@/lib/analytics';

/**
 * Renders nothing at all until NEXT_PUBLIC_GA_ID is set, so the site ships with
 * no third-party request on the critical path. Loaded after interactivity, so
 * it cannot affect LCP.
 */
export default function Analytics() {
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
