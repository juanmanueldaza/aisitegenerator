import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeployment } from '../../../src/hooks/useDeployment';

// Mock dependencies
vi.mock('@/store/siteStore', () => ({
  useSiteStore: vi.fn(() => ({
    content: '<html><body>Test content</body></html>',
  })),
}));

describe('useDeployment Hook', () => {
  it('should return correct initial state', () => {
    const { result } = renderHook(() => useDeployment());

    expect(result.current.activeSection).toBe('repository');
    expect(result.current.content).toBe('<html><body>Test content</body></html>');
    expect(result.current.setActiveSection).toBeInstanceOf(Function);
    expect(result.current.sections).toHaveLength(2);
  });

  it('should have correct section structure', () => {
    const { result } = renderHook(() => useDeployment());

    expect(result.current.sections).toEqual([
      {
        id: 'repository',
        label: 'Repository Setup',
        description: 'Configure your GitHub repository settings',
        icon: '📁',
      },
      {
        id: 'deployment',
        label: 'Deploy Website',
        description: 'Deploy your website to GitHub Pages',
        icon: '🚀',
      },
    ]);
  });

  it('should change active section', () => {
    const { result } = renderHook(() => useDeployment());

    act(() => {
      result.current.setActiveSection('deployment');
    });

    expect(result.current.activeSection).toBe('deployment');
  });

  it('should handle section changes correctly', () => {
    const { result } = renderHook(() => useDeployment());

    // Test changing to deployment
    act(() => {
      result.current.setActiveSection('deployment');
    });
    expect(result.current.activeSection).toBe('deployment');

    // Test changing back to repository
    act(() => {
      result.current.setActiveSection('repository');
    });
    expect(result.current.activeSection).toBe('repository');
  });
});
