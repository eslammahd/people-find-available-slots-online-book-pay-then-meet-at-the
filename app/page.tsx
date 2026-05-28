import Link from 'next/link';
import { Calendar, CreditCard, Video, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sage-600 to-sage-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">👨‍⚕️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dr. Saad El Mahdy</h1>
          <p className="text-sage-100 text-xl mb-2">Licensed Therapist · 60+ Years of Experience</p>
          <p className="text-sage-200 text-lg mb-10 max-w-2xl mx-auto">
            Professional online therapy sessions via Google Meet. Book your slot, pay securely, and receive your meeting link instantly.
          </p>
          <Link href="/book" className="inline-block bg-white text-sage-700 font-semibold text-lg px-10 py-4 rounded-2xl hover:bg-sage-50 transition-all duration-200 shadow-lg">
            Book a Session
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Calendar, step: '1', title: 'Pick a slot', desc: 'Browse available dates and times that work for you.' },
            { icon: Clock, step: '2', title: 'Choose duration', desc: 'Select how long you need — up to 2 hours.' },
            { icon: CreditCard, step: '3', title: 'Pay securely', desc: 'Fixed-price session, secured by Stripe.' },
            { icon: Video, step: '4', title: 'Meet online', desc: 'Receive your Google Meet link instantly by email.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 bg-sage-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Icon className="w-8 h-8 text-sage-600" />
              </div>
              <div className="text-xs font-bold text-sage-500 uppercase tracking-wide mb-1">Step {step}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/book" className="btn-primary inline-block text-lg px-12 py-4">
            Book Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-200 py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Dr. Saad El Mahdy. All rights reserved.
      </footer>
    </main>
  );
}
