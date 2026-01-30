'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Pending Reminder Interface
 */
export interface PendingReminder {
  task_id: number;
  task_title: string;
  reminder_time: string;
  is_snoozed: boolean;
  snooze_count: number;
}

/**
 * Play "tick tick, tick tick" alarm sound using Web Audio API
 * Creates a realistic alarm clock sound pattern
 */
function playAlarmSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Function to create a single "tick" sound
    const createTick = (startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // High-pitched sharp tick sound
      oscillator.frequency.value = 1200; // Hz - high pitch for "tick"
      oscillator.type = 'sine';

      // Sharp attack and quick decay for "tick" effect
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05); // Quick decay

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.05);
    };

    // Create "tick tick, tick tick" pattern
    const now = audioContext.currentTime;

    // First pair: tick tick
    createTick(now);           // First tick
    createTick(now + 0.15);    // Second tick (150ms later)

    // Second pair: tick tick (after a longer pause)
    createTick(now + 0.5);     // Third tick (500ms from start)
    createTick(now + 0.65);    // Fourth tick (650ms from start)

    // Third pair: tick tick
    createTick(now + 1.0);     // Fifth tick
    createTick(now + 1.15);    // Sixth tick

    // Fourth pair: tick tick
    createTick(now + 1.5);     // Seventh tick
    createTick(now + 1.65);    // Eighth tick

  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }
}

/**
 * Hook for managing task reminders and notifications
 *
 * Features:
 * - Polls backend for pending reminders
 * - Requests browser notification permission
 * - Shows browser notifications for reminders
 * - Tracks shown reminders to prevent duplicates
 */
export function useReminders(userId: string, token: string) {
  const [reminders, setReminders] = useState<PendingReminder[]>([]);
  const [shownReminders, setShownReminders] = useState<Set<number>>(new Set());
  const [hasPermission, setHasPermission] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  /**
   * Show browser notification for a reminder
   */
  const showNotification = useCallback((reminder: PendingReminder) => {
    if (!hasPermission || shownReminders.has(reminder.task_id)) {
      return;
    }

    try {
      // Play "tick tick, tick tick" alarm sound
      try {
        playAlarmSound();
      } catch {
        // Ignore audio errors
      }

      const notification = new Notification('⏰ TaskFlow Reminder', {
        body: reminder.task_title,
        icon: '/taskflow-icon.png',
        badge: '/badge-icon.png',
        tag: `task-${reminder.task_id}`,
        requireInteraction: true, // Stays until user interacts
        silent: false, // Browser should play sound
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Mark as shown
      setShownReminders(prev => new Set(prev).add(reminder.task_id));

      // Acknowledge reminder to backend
      acknowledgeReminder(userId, reminder.task_id, token);

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, [hasPermission, shownReminders, userId, token]);

  /**
   * Fetch pending reminders from backend
   */
  const fetchReminders = useCallback(async () => {
    if (!userId || !token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reminders/${userId}/pending`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for Better Auth
        }
      );

      if (response.ok) {
        const pending: PendingReminder[] = await response.json();

        // Show notifications for new reminders
        pending.forEach(reminder => {
          showNotification(reminder);
        });

        setReminders(pending);
      } else {
        console.error('Failed to fetch reminders:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }, [userId, token, showNotification]);

  /**
   * Poll for reminders every 30 seconds
   */
  useEffect(() => {
    if (!userId || !token) return;

    // Fetch immediately
    fetchReminders();

    // Then poll every 30 seconds
    const interval = setInterval(() => {
      fetchReminders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, token, fetchReminders]);

  /**
   * Manually refresh reminders
   */
  const refreshReminders = useCallback(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    hasPermission,
    refreshReminders,
  };
}

/**
 * Acknowledge a reminder to the backend
 * This prevents showing the same reminder multiple times
 */
async function acknowledgeReminder(userId: string, taskId: number, token: string) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reminders/${userId}/acknowledge/${taskId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for Better Auth
      }
    );
  } catch (error) {
    console.error('Failed to acknowledge reminder:', error);
  }
}
