'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PendingReminder } from '@/hooks/useReminders';

interface ReminderNotificationProps {
  reminder: PendingReminder;
  onSnooze: (taskId: number, minutes: number) => void;
  onDismiss: (taskId: number) => void;
  onViewTask: (taskId: number) => void;
}

/**
 * In-app notification component for task reminders
 * Shows as a floating banner with snooze/dismiss options
 */
export function ReminderNotification({
  reminder,
  onSnooze,
  onDismiss,
  onViewTask,
}: ReminderNotificationProps) {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  const snoozeOptions = [
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
  ];

  const handleSnooze = (minutes: number) => {
    onSnooze(reminder.task_id, minutes);
    setShowSnoozeMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className="bg-white border-2 border-metallic-blue shadow-2xl rounded-2xl p-5 w-full max-w-md"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-4xl">⏰</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-metallic-navy mb-1">
            Task Reminder
          </h3>
          <p className="text-base text-metallic-navy font-semibold">
            {reminder.task_title}
          </p>
          {reminder.is_snoozed && (
            <p className="text-xs text-warning mt-1">
              🔔 Snoozed {reminder.snooze_count} time(s)
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(reminder.task_id)}
          className="text-metallic-navy/50 hover:text-error transition-colors"
          aria-label="Dismiss reminder"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewTask(reminder.task_id)}
          className="flex-1 px-4 py-2.5 bg-metallic-blue text-white rounded-lg font-semibold hover:bg-metallic-blue-light transition-all duration-200 hover:scale-105"
        >
          📋 View Task
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
            className="px-4 py-2.5 bg-warning text-white rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-200 hover:scale-105"
          >
            ⏰ Snooze
          </button>

          {/* Snooze Menu */}
          <AnimatePresence>
            {showSnoozeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full right-0 mb-2 bg-white border-2 border-metallic-sky rounded-lg shadow-xl p-2 z-50 min-w-[140px]"
              >
                {snoozeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSnooze(option.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-metallic-sky-light rounded-md transition-colors text-metallic-navy"
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
