import { useState } from 'react';
import { ChatTab } from '@/components/tabs/ChatTab';
import { EditorTab } from '@/components/tabs/EditorTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { DeployTab } from '@/components/tabs/DeployTab';
import { Layout } from '@/components/layout/Layout';
import { ServiceProvider } from '@/di/ServiceContext';
import { createConfiguredContainer } from '@/di/service-registry';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'settings' | 'deploy'>('chat');

  // Initialize DI container with all services
  const container = createConfiguredContainer();

  return (
    <ServiceProvider container={container}>
      <Layout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              AI Site Generator
            </h1>
            <p className="text-gray-600">Create beautiful websites with AI assistance</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'chat', label: '💬 Chat', description: 'AI Conversation' },
              { id: 'editor', label: '📝 Editor', description: 'Content Editor' },
              { id: 'settings', label: '⚙️ Settings', description: 'Configuration' },
              { id: 'deploy', label: '🚀 Deploy', description: 'Deployment' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'chat' | 'editor' | 'settings' | 'deploy')}
                className={`flex-1 px-4 py-3 font-medium text-sm rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              {activeTab === 'chat' && <ChatTab />}
              {activeTab === 'editor' && <EditorTab />}
              {activeTab === 'settings' && <SettingsTab />}
              {activeTab === 'deploy' && <DeployTab />}
            </div>
          </div>
        </div>
      </Layout>
    </ServiceProvider>
  );
}

export default App;
