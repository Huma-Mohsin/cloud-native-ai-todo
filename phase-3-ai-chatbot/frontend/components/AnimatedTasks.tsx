'use client';

import { useEffect, useState } from 'react';

const TASK_DATA = [
  { emoji: '📝', label: 'Create', color: 'from-primary-500 to-primary-600', delay: 0 },
  { emoji: '✅', label: 'Complete', color: 'from-success-500 to-success-600', delay: 0.5 },
  { emoji: '📋', label: 'Organize', color: 'from-accent-400 to-accent-500', delay: 1 },
  { emoji: '🔔', label: 'Remind', color: 'from-warning-500 to-warning-600', delay: 1.5 },
  { emoji: '🎯', label: 'Focus', color: 'from-error-500 to-error-600', delay: 2 },
  { emoji: '📊', label: 'Track', color: 'from-info-500 to-info-600', delay: 2.5 },
];

const FLOATING_ICONS = ['✨', '💡', '🚀', '⭐', '💫', '🎨'];

export function AnimatedTasks() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TASK_DATA.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-between py-8 overflow-hidden">
      {/* Light Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        {/* Animated gradient orbs - smaller */}
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-primary-200/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[150px] h-[150px] bg-accent-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-beige-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating particles - fewer and smaller */}
      {mounted && FLOATING_ICONS.map((icon, i) => (
        <div
          key={i}
          className="absolute text-lg opacity-20 animate-float"
          style={{
            left: `${15 + (i * 14)}%`,
            top: `${5 + (i % 3) * 15}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + i}s`,
          }}
        >
          {icon}
        </div>
      ))}

      {/* Spacer for top */}
      <div className="flex-shrink-0 h-4"></div>

      {/* Main Animation Container - fixed height */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ height: '280px', width: '280px' }}>
        {/* Decorative rings - smaller */}
        <div className="absolute flex items-center justify-center pointer-events-none">
          <div className="absolute w-[240px] h-[240px] border-2 border-dashed border-primary-200/40 rounded-full animate-spin" style={{ animationDuration: '30s' }}></div>
          <div className="absolute w-[190px] h-[190px] border border-accent-200/50 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
          <div className="absolute w-[140px] h-[140px] border-2 border-beige-300/40 rounded-full animate-pulse"></div>
        </div>

        {/* Central AI Hub - smaller */}
        <div className={`relative z-20 transition-all duration-1000 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          {/* Glow effect */}
          <div className="absolute -inset-6 bg-gradient-to-r from-primary-400/20 via-accent-400/20 to-primary-400/20 rounded-full blur-2xl animate-pulse"></div>

          {/* Main circle */}
          <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-primary-100">
            {/* Inner gradient ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-50 to-accent-50"></div>

            {/* Brain icon */}
            <div className="relative text-center z-10">
              <div className="text-3xl mb-0.5 animate-bounce-slow">🧠</div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500 text-[9px] font-bold tracking-wider uppercase">AI</span>
            </div>

            {/* Orbiting dot */}
            <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-primary"></div>
            </div>
          </div>
        </div>

        {/* Orbiting Task Cards - smaller radius and size */}
        {mounted && (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="relative w-[280px] h-[280px]">
              {TASK_DATA.map((task, index) => {
                const angle = (index * 60 - 90) * (Math.PI / 180);
                const radius = 110;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isActive = index === activeIndex;

                return (
                  <div
                    key={task.label}
                    className={`absolute transition-all duration-500 pointer-events-auto ${isActive ? 'scale-110 z-30' : 'scale-100 z-10'}`}
                    style={{
                      left: `calc(50% + ${x}px - 28px)`,
                      top: `calc(50% + ${y}px - 28px)`,
                    }}
                  >
                    <div
                      className={`w-14 h-14 bg-white rounded-xl shadow-md flex flex-col items-center justify-center border-2 cursor-pointer hover:scale-110 transition-all duration-300 ${isActive ? 'border-primary-400 shadow-primary' : 'border-beige-200 hover:border-primary-300'}`}
                    >
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${task.color} flex items-center justify-center mb-0.5 shadow-sm`}>
                        <span className="text-sm">{task.emoji}</span>
                      </div>
                      <span className="text-content-secondary text-[7px] font-semibold uppercase tracking-wide">{task.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Branding - fixed at bottom with proper spacing */}
      <div className={`relative z-30 text-center px-4 flex-shrink-0 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 mb-1">
          TaskFlow AI
        </h2>
        <p className="text-content-muted text-xs mb-2">Your intelligent task assistant</p>

        {/* Feature tags - smaller */}
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 bg-white text-primary-500 text-[10px] font-semibold rounded-full border border-primary-200 shadow-sm">
            ⚡ Smart
          </span>
          <span className="px-2.5 py-0.5 bg-white text-accent-500 text-[10px] font-semibold rounded-full border border-accent-200 shadow-sm">
            🚀 Fast
          </span>
          <span className="px-2.5 py-0.5 bg-white text-success-500 text-[10px] font-semibold rounded-full border border-success-50 shadow-sm">
            ✨ Intuitive
          </span>
        </div>
      </div>
    </div>
  );
}
