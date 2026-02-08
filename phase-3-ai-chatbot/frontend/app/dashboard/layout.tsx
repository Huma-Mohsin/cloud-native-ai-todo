import { Suspense } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-400 mx-auto"></div>
          <p className="mt-4 text-brand-200">Loading...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}
