import React from 'react';
import type { LayoutProps } from './Layout.types';

/**
 * Enhanced Layout component with sci-fi aesthetic
 * Features glassmorphism, subtle animations, and futuristic design
 * Uses DaisyUI components for consistent theming
 */
export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 ${className}`}
    >
      {/* Animated background particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-px h-px bg-primary rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-px h-px bg-secondary rounded-full opacity-30 animate-ping"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-accent rounded-full opacity-25 animate-pulse"></div>
      </div>

      {/* Header with glassmorphism effect */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-300/50">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <div className="flex items-center">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <ul className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-300/50 w-52 z-10">
                <li>
                  <a className="block px-4 py-2 hover:bg-blue-50 transition-colors rounded">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a className="block px-4 py-2 hover:bg-blue-50 transition-colors rounded">
                    Projects
                  </a>
                </li>
                <li>
                  <a className="block px-4 py-2 hover:bg-blue-50 transition-colors rounded">
                    Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI Site Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0l8.66-4.517M12 9L3.34 4.483"
                />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            </div>
            <div className="border-l border-gray-300 h-6"></div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">U</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with responsive grid */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar for navigation/tools */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg backdrop-filter backdrop-blur-2xl bg-opacity-80 border border-white/20">
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-4">Navigation</h3>
                  <nav className="space-y-2">
                    <a className="flex items-center justify-start w-full px-3 py-2 text-sm rounded hover:bg-blue-50 transition-all duration-200">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                        />
                      </svg>
                      Dashboard
                    </a>
                    <a className="flex items-center justify-start w-full px-3 py-2 text-sm rounded hover:bg-blue-50 transition-all duration-200">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Projects
                    </a>
                    <a className="flex items-center justify-start w-full px-3 py-2 text-sm rounded hover:bg-blue-50 transition-all duration-200">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-lg backdrop-filter backdrop-blur-2xl bg-opacity-80 border border-white/20">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with subtle design */}
      <footer className="mt-auto border-t border-gray-300/50 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-md"></div>
              <span className="text-sm text-gray-600">© 2025 AI Site Generator</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
