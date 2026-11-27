/**
 * Single source of truth for everything HTH-specific.
 * Nothing in here is invented: every value comes from the company document,
 * the confirmed price sheet, or the owner interview of 2 Sep 2026.
 */

export const site = {
  name: 'HTH Limousine',
  legalName: 'Công ty Cổ phần Đầu tư Phát Triển HTH',
  url: 'https://hth.com.vn',
  foundedYear: 2013,

  /** Confirmed 2 Sep 2026. The 0902 variant in the interview was a typo. */
  phone: {
    display: '0903 760 187',
    displayIntl: '+84 903 760 187',
    tel: '+84903760187',
    zalo: 'https://zalo.me/0903760187',
    whatsapp: 'https://wa.me/84903760187',
    messenger: 'https://m.me/hthlimousine',
  },

  email: 'sales4@hth.com.vn',

  address: {
    line: 'B3.21 & B3.22, Tòa nhà Millennium, 132 Bến Vân Đồn',
    ward: 'Phường Khánh Hội',
    city: 'TP. Hồ Chí Minh',
    country: 'VN',
    lat: 10.7608,
    lng: 106.7013,
    /** What Google Maps is asked to find, for both the embed and the link. */
    mapsQuery: 'Chung cư Millennium, 132 Bến Vân Đồn, Hồ Chí Minh',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Chung%20c%C6%B0%20Millennium%2C%20132%20B%E1%BA%BFn%20V%C3%A2n%20%C4%90%E1%BB%93n%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh',
  },

  /** TODO — awaiting HTH: business registration number, tax code, social URLs. */
  social: [] as string[],
} as const;

export const yearsInService = new Date().getFullYear() - site.foundedYear;

/**
 * Whether this deployment may be indexed.
 *
 * Every canonical on the site points at https://hth.com.vn. While the new site
 * lives on a *.vercel.app host and hth.com.vn still serves the old Joomla
 * site, an indexable deployment is a second copy of the whole site under a
 * domain that contradicts its own canonicals. So indexing is off unless it is
 * switched on deliberately.
 *
 * ON CUTOVER: point hth.com.vn at Vercel, then set
 * NEXT_PUBLIC_ALLOW_INDEXING=true in the Vercel Production environment and
 * redeploy. Without that step the live site tells Google to stay away.
 */
export const indexable = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
