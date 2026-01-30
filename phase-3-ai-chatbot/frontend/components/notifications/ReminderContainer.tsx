'use client';

import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useReminders } from '@/hooks/useReminders';
import { ReminderNotification } from './ReminderNotification';
import { getChatService } from '@/services/chatService';

interface ReminderContainerProps {
  userId: string;
  token: string;
}

/**
 * Container for displaying task reminder notifications
 * Manages multiple reminders and handles snooze/dismiss actions
 */
export function ReminderContainer({ userId, token }: ReminderContainerProps) {
  const router = useRouter();
  const { reminders, refreshReminders } = useReminders(userId, token);
  const chatService = getChatService();

  const handleSnooze = async (taskId: number, minutes: number) => {
    try {
      // Use direct API to snooze (bypasses chat rate limit)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/${userId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            message: `Snooze task ${taskId} for ${minutes} minutes`,
          }),
        }
      );

      if (response.ok) {
        // Refresh reminders list
        setTimeout(() => {
          refreshReminders();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  };

  const handleDismiss = async (taskId: number) => {
    try {
      // Use dismiss endpoint to properly disable the reminder
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reminders/${userId}/dismiss/${taskId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        // Immediately remove from UI
        refreshReminders();
      }
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
    }
  };

  const handleViewTask = async (taskId: number) => {
    console.log('View Task clicked for task ID:', taskId);

    try {
      // Dismiss the notification first
      await handleDismiss(taskId);

      // Navigate to dashboard with task ID as query parameter
      router.push(`/dashboard?highlightTask=${taskId}`);

      // Give user visual feedback in console
      console.log('Navigating to dashboard to view task', taskId);
    } catch (error) {
      console.error('Error in handleViewTask:', error);
    }
  };

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {reminders.map((reminder) => (
          <ReminderNotification
            key={reminder.task_id}
            reminder={reminder}
            onSnooze={handleSnooze}
            onDismiss={handleDismiss}
            onViewTask={handleViewTask}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
