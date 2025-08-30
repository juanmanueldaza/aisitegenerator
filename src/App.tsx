import { useState } from 'react';
import { ChatTab } from '@/components/tabs/ChatTab';
import { EditorTab } from '@/components/tabs/EditorTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { DeployTab } from '@/components/tabs/DeployTab';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'settings' | 'deploy'>('chat');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">AI Site Generator</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'chat', label: 'Chat' },
            { id: 'editor', label: 'Editor' },
            { id: 'settings', label: 'Settings' },
            { id: 'deploy', label: 'Deploy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'chat' | 'editor' | 'settings' | 'deploy')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'editor' && <EditorTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'deploy' && <DeployTab />}
        </div>
      </div>
    </div>
  );
}

export default App;
