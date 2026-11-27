import { rateColumns, type RateColumn, type RateRow } from '@/data/rates';
import { formatVnd } from '@/lib/quote';
import { t, type Locale } from '@/lib/i18n';
import styles from './RateTable.module.css';

interface Props {
  rows: RateRow[];
  /** Restrict to one vehicle's column; omit to show every class. */
  only?: RateColumn;
  note?: string;
  caption?: string;
  locale?: Locale;
}

export default function RateTable({ rows, only, note, caption, locale = 'vi' }: Props) {
  if (rows.length === 0) return null;
  const copy = t(locale);
  const columns = only ? rateColumns.filter((column) => column.key === only) : rateColumns;

  return (
    <>
      <div className={styles.wrap}>
        <table className={`${styles.table} ${only ? styles.narrow : styles.wide}`}>
          {caption ? (
            <caption
              style={{
                captionSide: 'bottom',
                textAlign: 'left',
                padding: '13px 18px',
                fontSize: 13,
                color: 'var(--ink-3)',
              }}
            >
              {caption}
            </caption>
          ) : null}
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'left' }}>{copy.rates.route}</th>
              {columns.map((column) => (
                <th key={column.key} scope="col">{column.short}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.route}-${row.duration}`}>
                <th scope="row" className={styles.route}>
                  {locale === 'en' ? row.routeEn : row.route}
                  <div className={styles.duration}>
                    {locale === 'en' ? row.durationEn : row.duration}
                  </div>
                </th>
                {columns.map((column) => {
                  const value = row.prices[column.key];
                  return (
                    <td key={column.key} className={value === null ? styles.onRequest : styles.amount}>
                      {value === null ? copy.rates.onRequest : `${formatVnd(value, locale)}₫`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
    </>
  );
}
