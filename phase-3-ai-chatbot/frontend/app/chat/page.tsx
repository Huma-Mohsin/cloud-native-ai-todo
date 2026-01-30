'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-metallic-gradient">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-metallic-blue-light mx-auto"></div>
        <p className="mt-4 text-metallic-navy">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
