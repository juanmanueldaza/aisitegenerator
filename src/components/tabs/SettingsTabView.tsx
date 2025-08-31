import { AiProviderSettings } from '@/components/features/AiProviderSettings';
import { Button } from '@/components/ui';
import type { SettingsSection } from '@/hooks/useSettings';

export interface SettingsTabViewProps {
  activeSection: SettingsSection;
  sections: Array<{
    id: SettingsSection;
    label: string;
    icon: string;
  }>;
  onSectionChange: (section: SettingsSection) => void;
  className?: string;
}

export function SettingsTabView({
  activeSection,
  sections,
  onSectionChange,
  className,
}: SettingsTabViewProps) {
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'ai-providers':
        return <AiProviderSettings />;

      case 'general':
        return (
          <div className="general-settings">
            <h3>General Settings</h3>
            <p>General application settings will be available here.</p>
            <div className="coming-soon">
              <p>🚧 Coming Soon</p>
              <ul>
                <li>Theme selection</li>
                <li>Language preferences</li>
                <li>UI customization</li>
              </ul>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="advanced-settings">
            <h3>Advanced Settings</h3>
            <p>Advanced configuration options will be available here.</p>
            <div className="coming-soon">
              <p>🚧 Coming Soon</p>
              <ul>
                <li>Performance settings</li>
                <li>Debug options</li>
                <li>Data management</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`settings-tab ${className || ''}`.trim()}>
      <div className="settings-container">
        {/* Settings Navigation */}
        <div className="settings-nav">
          <h2>Settings</h2>
          <nav className="settings-menu">
            {sections.map((section) => (
              <Button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                variant={activeSection === section.id ? 'primary' : 'secondary'}
                className="settings-nav-button"
                data-testid={`settings-section-${section.id}`}
              >
                {section.icon} {section.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="settings-content">{renderActiveSection()}</div>
      </div>
    </div>
  );
}
