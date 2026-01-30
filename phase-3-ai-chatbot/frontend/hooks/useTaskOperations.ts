/**
 * useTaskOperations Hook
 *
 * Handles all CRUD operations for tasks with:
 * - Create, update, delete, toggle completion
 * - Error handling and loading states
 * - Integration with task service
 */

'use client';

import { useState } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';
import * as taskService from '@/services/taskService';

export function useTaskOperations(userId: string, token?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (data: CreateTaskRequest): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await taskService.createTask(userId, data, token);
      return newTask;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: number, data: UpdateTaskRequest): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.updateTask(userId, taskId, data, token);
      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(userId, taskId, token);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: Task): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.updateTask(
        userId,
        task.id,
        { completed: !task.completed },
        token
      );
      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle task completion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    isLoading,
    error,
    clearError,
  };
}
