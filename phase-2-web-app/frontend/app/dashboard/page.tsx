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

import { useEffect, useState } from 'react';
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

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (!isLoading) {
      loadTasks();
    }
  }, [smartFilter, searchQuery, selectedCategory, sortBy, showCompleted, showArchived]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadTasks(), loadStats(), loadCategories()]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
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
  };

  const loadStats = async () => {
    try {
      const statsData = await taskClient.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await taskClient.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Blobs for Visual Appeal */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Analytics Sidebar - Left Side */}
        <AnalyticsSidebar stats={stats} isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header - Glassmorphism effect */}
          <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20 shadow-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text animate-slide-up flex items-center gap-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              My Tasks
            </h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 shadow-sm">
                  <span className="text-xl">👋</span>
                  <p className="text-base font-medium text-gray-700">
                    Welcome back, <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{user.name || user.email}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSidebar(!showSidebar)}
                  variant="outline"
                  size="sm"
                  className={`border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all ${showSidebar ? 'bg-purple-100 border-purple-400' : ''}`}
                >
                  📈 Analytics
                </Button>
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  📥 JSON
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  📊 CSV
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  isLoading={authLoading}
                  className="border-red-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3 animate-in">
              {user && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 shadow-sm mb-2">
                  <span className="text-xl">👋</span>
                  <p className="text-base font-medium text-gray-700">
                    Welcome back, <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{user.name || user.email}</span>
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => { setShowSidebar(!showSidebar); setShowMobileMenu(false); }}
                  variant="outline"
                  size="sm"
                  className={`w-full justify-center ${showSidebar ? 'bg-purple-100 border-purple-400' : ''}`}
                >
                  📈 Analytics
                </Button>
                <Button
                  onClick={() => { handleExport('json'); setShowMobileMenu(false); }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  Export JSON
                </Button>
                <Button
                  onClick={() => { handleExport('csv'); setShowMobileMenu(false); }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  Export CSV
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  isLoading={authLoading}
                  className="w-full justify-center"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Task Form - Beautiful card */}
        <div className="card p-6 sm:p-8 mb-8 animate-scale-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-300/50">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Create New Task</h2>
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
              className="text-base font-medium text-blue-600 hover:text-blue-800 focus:outline-none whitespace-nowrap transition-colors"
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
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-6 mb-6 shadow-lg animate-scale-in">
            <div className="flex items-center gap-4">
              <span className="text-3xl">⚠️</span>
              <p className="text-base font-semibold text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {smartFilter === 'all' && '📝 All Tasks'}
              {smartFilter === 'today' && "📅 Today's Tasks"}
              {smartFilter === 'overdue' && '⚠️ Overdue Tasks'}
              {smartFilter === 'upcoming' && '📆 Upcoming Tasks'}
              {smartFilter === 'completed' && '✅ Completed Tasks'}
              {tasks.length > 0 && (
                <span className="ml-3 px-4 py-1.5 text-base font-bold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full shadow-sm">
                  {tasks.length}
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="card text-center py-20 animate-scale-in">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-6 text-lg font-semibold text-gray-600">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="card text-center py-20 animate-scale-in">
              <span className="text-7xl mb-6 inline-block">📭</span>
              <p className="text-xl font-semibold text-gray-700">
                {smartFilter === 'all' && 'No tasks yet. Create your first task above!'}
                {smartFilter === 'today' && 'No tasks due today.'}
                {smartFilter === 'overdue' && 'No overdue tasks. Great job!'}
                {smartFilter === 'upcoming' && 'No upcoming tasks.'}
                {smartFilter === 'completed' && 'No completed tasks yet.'}
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
