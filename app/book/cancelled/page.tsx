import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CancelledPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
      <div className="card max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 mb-6">No charge was made. Your slot has not been reserved.</p>
        <Link href="/book" className="btn-primary inline-block">Try Again</Link>
      </div>
    </div>
  );
}
