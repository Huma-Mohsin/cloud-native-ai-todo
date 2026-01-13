/**
 * Dashboard Page - Complete Professional Todo App
 *
 * Features:
 * - Enhanced statistics
 * - Search & smart filters
 * - Category & tag management
 * - Priority & due dates
 * - Subtasks
 * - Export functionality
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { SearchBar } from '@/components/SearchBar';
import { SmartFilters, SmartFilterType } from '@/components/SmartFilters';
import { SortDropdown, SortOption } from '@/components/SortDropdown';
import { FilterPanel } from '@/components/FilterPanel';
import { AnalyticsSidebar } from '@/components/AnalyticsSidebar';
import { taskClient, TaskQueryParams } from '@/lib/tasks';
import { Task, TaskStats, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Filter state
  const [smartFilter, setSmartFilter] = useState<SmartFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const loadTasks = useCallback(async () => {
    setError('');
    try {
      let tasksData: Task[];

      // Smart filters override other filters
      if (smartFilter === 'today') {
        tasksData = await taskClient.getToday();
      } else if (smartFilter === 'overdue') {
        tasksData = await taskClient.getOverdue();
      } else if (smartFilter === 'upcoming') {
        tasksData = await taskClient.getUpcoming(7);
      } else {
        // Use query params for 'all' and 'completed' filters
        const params: TaskQueryParams = {
          completed: smartFilter === 'completed' ? true : (showCompleted ? undefined : false),
          archived: showArchived,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          sort_by: sortBy,
        };

        tasksData = await taskClient.getAll(params);
      }

      setTasks(tasksData);
    } catch (err: any) {
      setError(err.detail || 'Failed to load tasks');
    }
  }, [smartFilter, searchQuery, selectedCategory, sortBy, showCompleted, showArchived]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await taskClient.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await taskClient.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadTasks(), loadStats(), loadCategories()]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadTasks, loadStats, loadCategories]);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Reload when filters change
  useEffect(() => {
    if (!isLoading) {
      loadTasks();
    }
  }, [isLoading, loadTasks]);

  const handleCreateTask = async (data: CreateTaskRequest) => {
    setIsCreating(true);
    setError('');
    try {
      await taskClient.create(data);
      await loadAllData();
    } catch (err: any) {
      setError(err.detail || 'Failed to create task');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await taskClient.toggleComplete(task);
      await loadAllData();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTask = async (taskId: number, data: UpdateTaskRequest) => {
    try {
      await taskClient.update(taskId, data);
      await loadAllData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskClient.delete(taskId);
      await loadAllData();
    } catch (err) {
      throw err;
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = format === 'json'
        ? await taskClient.exportJSON()
        : await taskClient.exportCSV();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(`Failed to export tasks: ${err.message}`);
    }
  };

  // Calculate smart filter counts
  const smartFilterCounts = {
    all: stats?.pending || 0,
    today: tasks.filter(t =>
      t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()
    ).length,
    overdue: stats?.overdue || 0,
    upcoming: tasks.filter(t =>
      t.due_date && new Date(t.due_date) > new Date()
    ).length,
    completed: stats?.completed || 0,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Charcoal Black Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#66b2ff] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-[#66b2ff] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Analytics Sidebar - Left Side */}
        <AnalyticsSidebar stats={stats} isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header - Charcoal Black Design */}
          <header className="sticky top-0 z-10 border-b border-[#3a3a3a] shadow-lg bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#b2bac2] flex items-center gap-3">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#66b2ff]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              My Tasks
            </h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-[#b2bac2]">
                    Welcome, <span className="font-semibold text-[#66b2ff]">{user.name || user.email}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSidebar(!showSidebar)}
                  variant="outline"
                  size="sm"
                  className={`border-[#3a3a3a] hover:border-[#66b2ff] hover:bg-[#2d2d2d] text-[#8b9ab0] hover:text-[#66b2ff] transition-all font-semibold px-4 py-2 ${showSidebar ? 'bg-[#2d2d2d] border-[#66b2ff] text-[#66b2ff]' : ''}`}
                >
                  📈 Analytics
                </Button>
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  size="sm"
                  className="border-[#3a3a3a] hover:border-[#66b2ff] hover:bg-[#2d2d2d] text-[#8b9ab0] hover:text-[#66b2ff] transition-all font-semibold px-4 py-2"
                >
                  📥 JSON
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  size="sm"
                  className="border-[#3a3a3a] hover:border-[#66b2ff] hover:bg-[#2d2d2d] text-[#8b9ab0] hover:text-[#66b2ff] transition-all font-semibold px-4 py-2"
                >
                  📊 CSV
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  isLoading={authLoading}
                  className="border-[#3a3a3a] hover:border-red-400 hover:bg-red-900/20 hover:text-red-400 text-[#8b9ab0] transition-all font-semibold px-4 py-2"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#66b2ff] text-[#b2bac2]"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#3a3a3a] space-y-3">
              {user && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a] mb-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-[#b2bac2]">
                    Welcome, <span className="font-semibold text-[#66b2ff]">{user.name || user.email}</span>
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => { setShowSidebar(!showSidebar); setShowMobileMenu(false); }}
                  variant="outline"
                  size="sm"
                  className={`w-full justify-center border-[#3a3a3a] hover:border-[#66b2ff] hover:bg-[#2d2d2d] text-[#8b9ab0] hover:text-[#66b2ff] font-semibold ${showSidebar ? 'bg-[#2d2d2d] border-[#66b2ff] text-[#66b2ff]' : ''}`}
                >
                  📈 Analytics
                </Button>
                <Button
                  onClick={() => { handleExport('json'); setShowMobileMenu(false); }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center border-[#3a3a3a] hover:border-[#66b2ff] hover:bg-[#2d2d2d] text-[#8b9ab0] hover:text-[#66b2ff] font-semibold"
                >
                  📥 JSON
                </Button>
                <Button
                  onClick={() => { handleExport('csv'); setShowMobileMenu(false); }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center border-[#3a3a3a] hover:border-[#66b2ff] hover:bg-[#2d2d2d] text-[#8b9ab0] hover:text-[#66b2ff] font-semibold"
                >
                  📊 CSV
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  isLoading={authLoading}
                  className="w-full justify-center border-[#3a3a3a] hover:border-red-400 hover:bg-red-900/20 hover:text-red-400 text-[#8b9ab0] font-semibold"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Task Form - Charcoal Black card */}
        <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#66b2ff] flex items-center justify-center">
              <span className="text-2xl text-white">+</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#b2bac2]">Create New Task</h2>
          </div>
          <TaskForm
            onSubmit={handleCreateTask}
            isLoading={isCreating}
            availableCategories={categories}
          />
        </div>

        {/* Search & Smart Filters */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* Search Bar */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Smart Filters */}
          <SmartFilters
            activeFilter={smartFilter}
            onChange={setSmartFilter}
            counts={smartFilterCounts}
          />

          {/* Sort & Advanced Filters Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-base font-medium text-[#66b2ff] hover:text-[#b2bac2] focus:outline-none whitespace-nowrap transition-colors"
            >
              {showFilters ? '🔼 Hide' : '🔽 Show'} advanced filters
            </button>
          </div>

          {/* Advanced Filter Panel */}
          {showFilters && (
            <FilterPanel
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              availableCategories={categories}
              showCompleted={showCompleted}
              onShowCompletedChange={setShowCompleted}
              showArchived={showArchived}
              onShowArchivedChange={setShowArchived}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-400 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#b2bac2]">
              {smartFilter === 'all' && 'All Tasks'}
              {smartFilter === 'today' && "Today's Tasks"}
              {smartFilter === 'overdue' && 'Overdue Tasks'}
              {smartFilter === 'upcoming' && 'Upcoming Tasks'}
              {smartFilter === 'completed' && 'Completed Tasks'}
              {tasks.length > 0 && (
                <span className="ml-2 px-3 py-1 text-sm font-medium bg-[#2d2d2d] text-[#66b2ff] rounded-lg border border-[#3a3a3a]">
                  {tasks.length}
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg shadow-lg text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#66b2ff] border-r-transparent"></div>
              <p className="mt-4 text-base font-medium text-[#b2bac2]">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#3a3a3a] rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)] text-center py-16 px-6">
              {/* Empty State SVG Illustration */}
              <div className="mb-6 flex justify-center">
                <svg className="w-32 h-32 text-[#66b2ff] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#b2bac2] mb-3">
                {smartFilter === 'all' && 'No Tasks Yet'}
                {smartFilter === 'today' && 'Nothing Due Today'}
                {smartFilter === 'overdue' && 'All Caught Up!'}
                {smartFilter === 'upcoming' && 'No Upcoming Tasks'}
                {smartFilter === 'completed' && 'No Completed Tasks'}
              </h3>
              <p className="text-base text-[#8b9ab0] max-w-md mx-auto">
                {smartFilter === 'all' && 'Start organizing your work by creating your first task above. Stay productive! 🚀'}
                {smartFilter === 'today' && 'You have no tasks scheduled for today. Enjoy your free time! ☀️'}
                {smartFilter === 'overdue' && 'Great job! You have no overdue tasks. Keep up the excellent work! 🎉'}
                {smartFilter === 'upcoming' && 'No tasks are scheduled for the upcoming week. Plan ahead! 📅'}
                {smartFilter === 'completed' && 'Complete some tasks to see them here. You got this! 💪'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onSubtasksUpdate={loadAllData}
                availableCategories={categories}
              />
            ))
          )}
        </div>
      </main>
        </div>
        {/* End Main Content */}
      </div>
      {/* End Main Layout */}
    </div>
  );
}
