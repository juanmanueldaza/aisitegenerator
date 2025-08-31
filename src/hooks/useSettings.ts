import { useState } from 'react';

export type SettingsSection = 'ai-providers' | 'general' | 'advanced';

export interface UseSettingsReturn {
  // State
  activeSection: SettingsSection;

  // Actions
  setActiveSection: (section: SettingsSection) => void;

  // Data
  sections: Array<{
    id: SettingsSection;
    label: string;
    icon: string;
  }>;
}

export function useSettings(): UseSettingsReturn {
  const [activeSection, setActiveSection] = useState<SettingsSection>('ai-providers');

  const sections = [
    {
      id: 'ai-providers' as const,
      label: 'AI Providers',
      icon: '🤖',
    },
    {
      id: 'general' as const,
      label: 'General',
      icon: '⚙️',
    },
    {
      id: 'advanced' as const,
      label: 'Advanced',
      icon: '🔧',
    },
  ];

  return {
    activeSection,
    setActiveSection,
    sections,
  };
}
