import { useState } from 'react';
import { useSiteStore } from '@/store/siteStore';

export type DeploymentSection = 'repository' | 'deployment';

export interface UseDeploymentReturn {
  // State
  activeSection: DeploymentSection;
  content: string;

  // Actions
  setActiveSection: (section: DeploymentSection) => void;

  // Data
  sections: Array<{
    id: DeploymentSection;
    label: string;
    description: string;
    icon: string;
  }>;
}

export function useDeployment(): UseDeploymentReturn {
  const [activeSection, setActiveSection] = useState<DeploymentSection>('repository');
  const { content } = useSiteStore();

  const sections = [
    {
      id: 'repository' as const,
      label: 'Repository Setup',
      description: 'Configure your GitHub repository settings',
      icon: '📁',
    },
    {
      id: 'deployment' as const,
      label: 'Deploy Website',
      description: 'Deploy your website to GitHub Pages',
      icon: '🚀',
    },
  ];

  return {
    activeSection,
    content,
    setActiveSection,
    sections,
  };
}
