import { ChatProvider } from './hooks/useChat';
import { ChatInterface } from './components/ChatInterface';

function App() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        <ChatInterface />
      </div>
    </ChatProvider>
  );
}

export default App;
