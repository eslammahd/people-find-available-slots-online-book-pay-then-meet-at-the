import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg">SM</div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">Dr. Saad El Mahdy</h1>
        <p className="text-xl text-brand-600 font-medium mb-4">Therapist MD &middot; Confidential Online Sessions</p>
        <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
          Book a private therapy session online. Choose a time, pay securely, and receive your Google Meet link instantly.
        </p>
        <div className="mt-8">
          <Link href="/book" className="btn-primary text-base inline-block">View Available Slots &rarr;</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
        {[
          { step: '1', title: 'Pick a Slot', desc: 'Choose from available time slots.' },
          { step: '2', title: 'Choose Duration', desc: '30 min up to 2 hours max.' },
          { step: '3', title: 'Pay Securely', desc: 'Fixed price, Stripe checkout.' },
          { step: '4', title: 'Get Meet Link', desc: 'Sent to your email instantly.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="card text-center">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">{step}</div>
            <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to Take the First Step?</h2>
        <p className="text-brand-100 mb-6">No account needed. Book as a guest in under 2 minutes.</p>
        <Link href="/book" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-all inline-block">Book Now</Link>
      </div>
    </div>
  );
}
