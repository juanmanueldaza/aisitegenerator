import { useSettings } from '@/hooks/useSettings';
import { SettingsTabView } from './SettingsTabView';

export function SettingsTab() {
  const settings = useSettings();

  return (
    <SettingsTabView
      activeSection={settings.activeSection}
      sections={settings.sections}
      onSectionChange={settings.setActiveSection}
    />
  );
}

export default SettingsTab;
