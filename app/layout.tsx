import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Saad El Mahdy — Therapy Sessions',
  description: 'Book an online therapy session with Dr. Saad El Mahdy. Find an available slot, pay securely, and meet via Google Meet.',
  openGraph: {
    title: 'Dr. Saad El Mahdy — Therapy Sessions',
    description: 'Book an online therapy session with Dr. Saad El Mahdy.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
