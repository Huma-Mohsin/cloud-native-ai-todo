'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { TaskEvent } from '@/services/websocketService';
import { Task } from '@/lib/types';

interface UseTaskSyncProps {
  userId: string;
  token?: string;
  initialTasks?: Task[];
  onTasksChange?: (tasks: Task[]) => void;
  enabled?: boolean;
}

/**
 * Hook to synchronize task state with WebSocket events.
 *
 * Manages task list and updates it in real-time based on WebSocket events.
 */
export function useTaskSync({
  userId,
  token,
  initialTasks = [],
  onTasksChange,
  enabled = true,
}: UseTaskSyncProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [lastEvent, setLastEvent] = useState<TaskEvent | null>(null);

  // Handle WebSocket events
  const handleTaskEvent = useCallback((event: TaskEvent) => {
    console.log('🔄 Processing task event:', event);
    setLastEvent(event);

    setTasks(prevTasks => {
      let updatedTasks = [...prevTasks];

      switch (event.type) {
        case 'task_created':
          // Add new task if not already present
          if (!updatedTasks.find(t => t.id === event.task_id)) {
            if (event.data) {
              updatedTasks.push(event.data as Task);
              console.log('✅ Task added:', event.task_id);
            }
          }
          break;

        case 'task_updated':
          // Update existing task
          updatedTasks = updatedTasks.map(task =>
            task.id === event.task_id
              ? { ...task, ...event.data }
              : task
          );
          console.log('✅ Task updated:', event.task_id);
          break;

        case 'task_deleted':
          // Remove deleted task
          updatedTasks = updatedTasks.filter(task => task.id !== event.task_id);
          console.log('✅ Task deleted:', event.task_id);
          break;

        case 'task_completed':
          // Update completion status
          updatedTasks = updatedTasks.map(task =>
            task.id === event.task_id
              ? { ...task, completed: event.data?.completed ?? true }
              : task
          );
          console.log('✅ Task completed:', event.task_id);
          break;

        default:
          console.warn('Unknown event type:', event.type);
      }

      // Notify parent immediately with updated tasks
      onTasksChange?.(updatedTasks);

      return updatedTasks;
    });
  }, [onTasksChange]);

  // Connect to WebSocket
  const { isConnected, getConnectionState } = useWebSocket({
    userId,
    token,
    onEvent: handleTaskEvent,
    enabled,
  });

  // Sync internal task list with external updates (from dashboard fetch)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Update tasks from external source
  const updateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  return {
    tasks,
    setTasks: updateTasks,
    lastEvent,
    lastEventTaskId: lastEvent?.task_id ?? null,
    lastEventType: lastEvent?.type ?? null,
    isConnected,
    getConnectionState,
  };
}
