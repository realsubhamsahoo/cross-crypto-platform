import { Suspense } from 'react';
import PaymentPlatform from '@/components/PaymentPlatform';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentPlatform />
      </Suspense>
    </main>
  );
}