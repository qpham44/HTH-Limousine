import { BookingPage, bookingMetadata } from '@/components/pages/StaticPages';

export const metadata = bookingMetadata('vi');

export default function Page() {
  return <BookingPage locale="vi" />;
}
