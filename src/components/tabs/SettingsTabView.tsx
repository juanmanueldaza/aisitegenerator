import { AiProviderSettings } from '@/components/features/AiProviderSettings';
import type { SettingsSection } from '@/hooks/useSettings';

export interface SettingsTabViewProps {
  activeSection: SettingsSection;
  sections: Array<{
    id: SettingsSection;
    label: string;
    icon: string;
  }>;
  onSectionChange: (section: SettingsSection) => void;
}

export function SettingsTabView({
  activeSection,
  sections,
  onSectionChange,
}: SettingsTabViewProps) {
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'ai-providers':
        return <AiProviderSettings />;

      case 'general':
        return (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">General Settings</h3>
              <p>General application settings will be available here.</p>
              <div className="alert alert-info mt-4">
                <span>🚧 Coming Soon</span>
                <div>
                  <ul className="list-disc list-inside mt-2">
                    <li>Theme selection</li>
                    <li>Language preferences</li>
                    <li>UI customization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Advanced Settings</h3>
              <p>Advanced configuration options will be available here.</p>
              <div className="alert alert-info mt-4">
                <span>🚧 Coming Soon</span>
                <div>
                  <ul className="list-disc list-inside mt-2">
                    <li>Performance settings</li>
                    <li>Debug options</li>
                    <li>Data management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-6">
        {/* Settings Navigation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <div className="tabs tabs-boxed justify-center">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`tab ${activeSection === section.id ? 'tab-active' : ''}`}
                data-testid={`settings-section-${section.id}`}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="min-h-[400px]">{renderActiveSection()}</div>
      </div>
    </div>
  );
}
