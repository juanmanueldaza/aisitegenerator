import { useState } from 'react';
import { ChatTab } from '@/components/tabs/ChatTab';
import { EditorTab } from '@/components/tabs/EditorTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { DeployTab } from '@/components/tabs/DeployTab';
import { ServiceProvider } from '@/di/ServiceContext';
import { createConfiguredContainer } from '@/di/service-registry';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'settings' | 'deploy'>('chat');

  // Initialize DI container with all services
  const container = createConfiguredContainer();

  const tabs = [
    { id: 'chat' as const, label: '💬 Chat', content: <ChatTab /> },
    { id: 'editor' as const, label: '📝 Editor', content: <EditorTab /> },
    { id: 'settings' as const, label: '⚙️ Settings', content: <SettingsTab /> },
    { id: 'deploy' as const, label: '🚀 Deploy', content: <DeployTab /> },
  ];

  return (
    <ServiceProvider container={container}>
      <div className="min-h-screen bg-base-200">
        {/* Header with Theme Selector */}
        <div className="navbar bg-base-100 shadow-lg">
          <div className="navbar-start">
            <div className="text-xl font-bold text-primary">AI Site Generator</div>
          </div>
          <div className="navbar-end">
            <ThemeSelector />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 px-4">
          <div className="tabs tabs-lift tabs-lg justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab tab-lg transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id ? 'tab-active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body min-h-[600px]">
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
          </div>
        </div>
      </div>
    </ServiceProvider>
  );
}

export default App;
