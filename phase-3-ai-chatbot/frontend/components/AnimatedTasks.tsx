/**
 * Animated Tasks Illustration Component
 *
 * Colorful, animated task cards that float and bounce on the login page
 */

'use client';

export function AnimatedTasks() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Gradient Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg space-y-6">

        {/* Title Section */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4">
            📋 TaskFlow AI
          </h2>
          <p className="text-2xl font-semibold text-gray-700">
            Organize your tasks with AI ✨
          </p>
        </div>

        {/* Floating Task Cards */}
        <div className="space-y-4">

          {/* Task Card 1 - Purple */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-floatUp animation-delay-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow">
                <span className="text-3xl">✅</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/80 rounded-full w-3/4 mb-2"></div>
                <div className="h-2 bg-white/60 rounded-full w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>

          {/* Task Card 2 - Pink to Orange */}
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-floatUp animation-delay-400 ml-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow animation-delay-1000">
                <span className="text-3xl">📝</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/80 rounded-full w-2/3 mb-2"></div>
                <div className="h-2 bg-white/60 rounded-full w-1/3"></div>
              </div>
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">✏️</span>
              </div>
            </div>
          </div>

          {/* Task Card 3 - Blue to Cyan */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-floatUp animation-delay-600">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow animation-delay-2000">
                <span className="text-3xl">📅</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/80 rounded-full w-4/5 mb-2"></div>
                <div className="h-2 bg-white/60 rounded-full w-2/5"></div>
              </div>
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
            </div>
          </div>

          {/* Task Card 4 - Green to Teal */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-floatUp animation-delay-800 ml-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow animation-delay-3000">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/80 rounded-full w-3/5 mb-2"></div>
                <div className="h-2 bg-white/60 rounded-full w-2/5"></div>
              </div>
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">📌</span>
              </div>
            </div>
          </div>

          {/* Task Card 5 - Indigo to Purple */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-floatUp animation-delay-1000 ml-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow animation-delay-4000">
                <span className="text-3xl">🔔</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/80 rounded-full w-3/4 mb-2"></div>
                <div className="h-2 bg-white/60 rounded-full w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Particles - Todo Icons */}
        <div className="absolute top-20 left-10 animate-float animation-delay-500">
          <span className="text-2xl">✍️</span>
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-1500">
          <span className="text-3xl">📌</span>
        </div>
        <div className="absolute bottom-32 left-16 animate-float animation-delay-2500">
          <span className="text-xl">⭐</span>
        </div>
        <div className="absolute bottom-20 right-12 animate-float animation-delay-3500">
          <span className="text-2xl">🏆</span>
        </div>
        <div className="absolute top-1/3 right-8 animate-float">
          <span className="text-xl">✔️</span>
        </div>
        <div className="absolute bottom-1/3 left-12 animate-float animation-delay-4500">
          <span className="text-3xl">📈</span>
        </div>

      </div>
    </div>
  );
}
