import React from 'react';
import type { LayoutProps } from './Layout.types';

/**
 * Main Layout component that provides consistent structure
 * Follows Single Responsibility Principle - only handles layout structure
 */
export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const layoutClasses = ['layout', className].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      <header className="layout__header">{/* Header content will be rendered here */}</header>

      <main className="layout__main" role="main">
        {children}
      </main>

      <footer className="layout__footer">{/* Footer content will be rendered here */}</footer>
    </div>
  );
};
