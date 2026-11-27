import { JournalIndexPage, journalIndexMetadata } from '@/components/pages/JournalPages';

export const metadata = journalIndexMetadata('en');

export default function Page() {
  return <JournalIndexPage locale="en" />;
}
