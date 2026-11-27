import { JournalIndexPage, journalIndexMetadata } from '@/components/pages/JournalPages';

export const metadata = journalIndexMetadata('vi');

export default function Page() {
  return <JournalIndexPage locale="vi" />;
}
