/**
 * Orbiting Tasks Animation Component
 *
 * Shows animated tasks orbiting around a user icon in circular motion
 * for login/signup pages
 */

'use client';

export function OrbitingTasks() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central User Icon */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse-slow">
        <span className="text-5xl">👤</span>
      </div>

      {/* Orbiting Tasks - Orbit 1 (Close) */}
      <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
        <div className="relative w-48 h-48">
          {/* Task 1 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-2xl">📝</span>
            </div>
          </div>

          {/* Task 2 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-2xl">✅</span>
            </div>
          </div>

          {/* Task 3 */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-2xl">📅</span>
            </div>
          </div>

          {/* Task 4 */}
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orbiting Tasks - Orbit 2 (Far) */}
      <div className="absolute inset-0 flex items-center justify-center animate-spin-reverse">
        <div className="relative w-72 h-72">
          {/* Task 5 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <span className="text-xl">🚀</span>
            </div>
          </div>

          {/* Task 6 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <span className="text-xl">⭐</span>
            </div>
          </div>

          {/* Task 7 */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-xl">💡</span>
            </div>
          </div>

          {/* Task 8 */}
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <span className="text-xl">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orbit Rings (Visual Effect) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full border-2 border-emerald-500/20 animate-pulse-slow"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full border-2 border-emerald-500/10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}
