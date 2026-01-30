/**
 * useDashboardData Hook
 *
 * Manages dashboard data fetching and state:
 * - Fetch tasks, stats, categories
 * - Handle loading and error states
 * - Integrate with WebSocket sync
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStats, SmartFilterType, SortOption } from '@/lib/types';
import * as taskService from '@/services/taskService';

interface UseDashboardDataProps {
  userId: string;
  token?: string;
  searchQuery?: string;
  smartFilter?: SmartFilterType;
  sortBy?: SortOption;
  category?: string | null;
  showCompleted?: boolean;
}

export function useDashboardData({
  userId,
  token,
  searchQuery = '',
  smartFilter = 'all',
  sortBy = 'created_at',
  category = null,
  showCompleted = false,
}: UseDashboardDataProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch tasks with filters
      let fetchedTasks: Task[] = [];

      if (smartFilter !== 'all') {
        // Use smart filter
        fetchedTasks = await taskService.getTasksBySmartFilter(userId, smartFilter, token);
      } else {
        // Fetch all tasks
        fetchedTasks = await taskService.getTasks(userId, token);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        fetchedTasks = fetchedTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.category?.toLowerCase().includes(query) ||
            task.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Apply category filter
      if (category) {
        fetchedTasks = fetchedTasks.filter((task) => task.category === category);
      }

      // Apply completed filter
      if (!showCompleted) {
        fetchedTasks = fetchedTasks.filter((task) => !task.completed);
      }

      // Sort tasks
      fetchedTasks = taskService.sortTasks(fetchedTasks, sortBy);

      setTasks(fetchedTasks);

      // Fetch stats
      const fetchedStats = await taskService.getTaskStats(userId, token);
      setStats(fetchedStats);

      // Extract unique categories
      const allTasks = await taskService.getTasks(userId, token);
      const categories = Array.from(
        new Set(allTasks.map((task) => task.category).filter((cat): cat is string => !!cat))
      ).sort();
      setAvailableCategories(categories);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, searchQuery, smartFilter, sortBy, category, showCompleted]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data manually
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Update tasks from WebSocket
  const updateTasksFromWebSocket = useCallback((updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  }, []);

  return {
    tasks,
    stats,
    availableCategories,
    isLoading,
    error,
    refreshData,
    updateTasksFromWebSocket,
  };
}
