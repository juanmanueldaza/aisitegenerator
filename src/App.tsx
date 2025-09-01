import { useState } from 'react';
import { ChatTab } from '@/components/tabs/ChatTab';
import { EditorTab } from '@/components/tabs/EditorTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { DeployTab } from '@/components/tabs/DeployTab';
import { ServiceProvider } from '@/di/ServiceContext';
import { createConfiguredContainer } from '@/di/service-registry';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'settings' | 'deploy'>('chat');

  // Initialize DI container with all services
  const container = createConfiguredContainer();

  const tabs = [
    { id: 'chat' as const, label: '💬 Chat', content: <ChatTab /> },
    { id: 'editor' as const, label: '📝 Editor', content: <EditorTab /> },
    { id: 'settings' as const, label: '⚙️ Settings', content: <SettingsTab /> },
    { id: 'deploy' as const, label: '🚀 Deploy', content: <DeployTab />, badge: 'New' },
  ];

  return (
    <ServiceProvider container={container}>
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        {/* Enhanced Header with Theme Selector */}
        <div className="navbar bg-base-100/80 backdrop-blur-lg shadow-lg border-b border-base-300">
          <div className="navbar-start">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI Site Generator
                </div>
                <div className="text-xs text-base-content/60">Powered by AI</div>
              </div>
            </div>
          </div>
          <div className="navbar-end">
            <ThemeSelector />
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="px-4 py-6">
          <div className="tabs tabs-lift tabs-lg justify-center max-w-4xl mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab tab-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  activeTab === tab.id ? 'tab-active shadow-lg' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="font-medium flex items-center gap-2">
                  {tab.label}
                  {tab.badge && (
                    <Badge variant="primary" size="xs" className="animate-pulse">
                      {tab.badge}
                    </Badge>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="container mx-auto px-4 pb-8">
          <Card variant="glass" hover className="shadow-2xl border border-base-300/50">
            <CardBody className="min-h-[600px] p-6">
              <div className="animate-in fade-in duration-300">
                {tabs.find((tab) => tab.id === activeTab)?.content}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </ServiceProvider>
  );
}

export default App;
