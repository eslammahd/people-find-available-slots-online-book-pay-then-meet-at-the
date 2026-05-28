import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Book a Session — Dr. Saad El Mahdy',
  description: 'Book an online therapy session with Dr. Saad El Mahdy, MD.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">SM</div>
              <div>
                <p className="font-semibold text-slate-800 text-sm leading-tight">Dr. Saad El Mahdy</p>
                <p className="text-xs text-slate-500">Therapist MD</p>
              </div>
            </div>
            <a href="/book" className="text-sm text-brand-600 font-medium hover:underline">Book a Session</a>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-white border-t border-slate-100 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Dr. Saad El Mahdy &middot; Online Therapy Sessions &middot; All sessions via Google Meet
          </div>
        </footer>
      </body>
    </html>
  );
}
