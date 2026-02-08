'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SplitScreenLayout } from '@/components/dashboard/SplitScreenLayout';
import { TaskDashboard } from '@/components/task/TaskDashboard';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-400 mx-auto"></div>
          <p className="mt-4 text-brand-200">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Extract user ID and token from session
  const userId = session.user?.id || '';
  const token = session.session?.token;

  // Get highlightTask from URL query parameter
  const highlightTaskId = searchParams.get('highlightTask');

  return (
    <main className="h-screen overflow-hidden">
      <SplitScreenLayout
        dashboardContent={
          <TaskDashboard
            userId={userId}
            token={token}
            highlightTaskId={highlightTaskId ? Number(highlightTaskId) : undefined}
          />
        }
        chatbotContent={<ChatInterface session={session} />}
      />
    </main>
  );
}
