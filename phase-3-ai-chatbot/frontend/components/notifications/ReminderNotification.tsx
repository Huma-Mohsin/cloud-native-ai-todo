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
      className="bg-white border-2 border-brand-500 shadow-brand-xl rounded-2xl p-5 w-full max-w-md"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-4xl">⏰</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-brand-950 mb-1">
            Task Reminder
          </h3>
          <p className="text-base text-brand-800 font-semibold">
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
          className="text-brand-400 hover:text-error transition-colors"
          aria-label="Dismiss reminder"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewTask(reminder.task_id)}
          className="flex-1 px-4 py-2.5 bg-primary-gradient text-white rounded-lg font-semibold hover:shadow-brand-lg transition-all duration-200 hover:scale-105"
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
                className="absolute bottom-full right-0 mb-2 bg-white border border-brand-200 rounded-lg shadow-brand-lg p-2 z-50 min-w-[140px]"
              >
                {snoozeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSnooze(option.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 rounded-md transition-colors text-brand-800"
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
