/**
 * SettingsTab Component
 * Main settings interface for the AI Site Generator
 * Handles AI provider configuration and other application settings
 */

import { useState } from 'react';
import { AiProviderSettings } from '@/components/features/AiProviderSettings';
import { Button } from '@/components/ui';
import './SettingsTab.css';

type SettingsSection = 'ai-providers' | 'general' | 'advanced';

export function SettingsTab() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('ai-providers');

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
    <div className="settings-tab">
      <div className="settings-container">
        {/* Settings Navigation */}
        <div className="settings-nav">
          <h2>Settings</h2>
          <nav className="settings-menu">
            <Button
              onClick={() => setActiveSection('ai-providers')}
              variant={activeSection === 'ai-providers' ? 'primary' : 'secondary'}
              className="settings-nav-button"
            >
              🤖 AI Providers
            </Button>
            <Button
              onClick={() => setActiveSection('general')}
              variant={activeSection === 'general' ? 'primary' : 'secondary'}
              className="settings-nav-button"
            >
              ⚙️ General
            </Button>
            <Button
              onClick={() => setActiveSection('advanced')}
              variant={activeSection === 'advanced' ? 'primary' : 'secondary'}
              className="settings-nav-button"
            >
              🔧 Advanced
            </Button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="settings-content">{renderActiveSection()}</div>
      </div>
    </div>
  );
}

export default SettingsTab;
