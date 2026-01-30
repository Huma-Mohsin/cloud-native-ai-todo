/**
 * AnalyticsPanel Component - Metallic Chic Theme
 *
 * Left sidebar panel dedicated to analytics and statistics:
 * - Fetches task stats
 * - Displays AnalyticsSidebar with charts
 * - Real-time WebSocket sync
 * - Always visible on desktop (25% width)
 */

'use client';

import { useState, useEffect } from 'react';
import { TaskStats } from '@/lib/types';
import { AnalyticsSidebar } from '@/components/task/AnalyticsSidebar';
import { useTaskSync } from '@/hooks/useTaskSync';

interface AnalyticsPanelProps {
  userId: string;
  token?: string;
}

export function AnalyticsPanel({ userId, token }: AnalyticsPanelProps) {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    today: 0,
    this_week: 0,
    high_priority: 0,
    archived: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket sync for real-time updates
  useTaskSync({
    userId,
    token,
    onTaskUpdate: () => {
      // Refetch stats when tasks are updated
      fetchStats();
    },
  });

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/stats`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-metallic-charcoal p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-blue mx-auto"></div>
          <p className="mt-2 text-sm text-metallic-silver">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-metallic-charcoal p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-metallic-silver mb-1 flex items-center gap-2">
          <span>📊</span>
          <span>Analytics</span>
        </h2>
        <p className="text-xs text-metallic-silver/70">Real-time insights</p>
      </div>
      <AnalyticsSidebar stats={stats} isOpen={true} onClose={() => {}} />
    </div>
  );
}
