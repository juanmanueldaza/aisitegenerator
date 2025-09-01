import React, { useState, useRef, useEffect } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardActions, CardTitle } from '@/components/ui/Card';
import { Modal, ModalActions } from '@/components/ui/Modal';

// Custom DaisyUI-powered Chat Interface
interface DaisyUIChatProps {
  introMessage: { text: string };
  textInput: { placeholder: { text: string } };
  requestBodyLimits: { maxMessages: number };
  history: Array<{ role: 'user' | 'ai'; text: string }>;
  connect: {
    handler: (
      body: { messages?: Array<{ text?: string }> },
      signals: { onResponse: (payload: { text?: string; error?: string }) => void }
    ) => void;
  };
  isReady: boolean;
}

function DaisyUIChat({
  introMessage,
  textInput,
  requestBodyLimits,
  history,
  connect,
  isReady,
}: DaisyUIChatProps) {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'ai'; text: string; timestamp: Date }>
  >([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert history to messages with timestamps
  useEffect(() => {
    const historyWithTimestamps = history.map((msg, index) => ({
      ...msg,
      timestamp: new Date(Date.now() - (history.length - index) * 60000), // Mock timestamps
    }));
    setMessages(historyWithTimestamps);
  }, [history]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isReady) return;

    const userMessage = {
      role: 'user' as const,
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        connect.handler(
          { messages: [{ text: userMessage.text }] },
          {
            onResponse: (payload) => {
              if (payload.error) {
                reject(new Error(payload.error));
              } else if (payload.text) {
                const aiMessage = {
                  role: 'ai' as const,
                  text: payload.text,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
                resolve();
              }
            },
          }
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-base-100" data-testid="daisyui-chat">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Intro Message */}
        {messages.length === 0 && introMessage.text && (
          <div className="flex justify-center">
            <Card
              variant="bordered"
              className="max-w-md bg-gradient-to-r from-primary/10 to-secondary/10"
            >
              <CardBody className="text-center">
                <div className="text-4xl mb-2">👋</div>
                <p className="text-base-content/80">{introMessage.text}</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-content'
                      : 'bg-secondary text-secondary-content'
                  }`}
                >
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
              </div>

              {/* Message Bubble */}
              <Card
                variant="bordered"
                className={`${
                  message.role === 'user'
                    ? 'bg-primary text-primary-content border-primary'
                    : 'bg-base-200 border-base-300'
                }`}
              >
                <CardBody className="p-3">
                  <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-primary-content/70' : 'text-base-content/60'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-secondary text-secondary-content">
                  🤖
                </div>
              </div>
              <Card variant="bordered" className="bg-base-200">
                <CardBody className="p-3">
                  <div className="flex items-center gap-2">
                    <Loading size="sm" />
                    <span className="text-sm text-base-content/70">AI is typing...</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center">
            <Alert variant="error" className="max-w-md">
              <div className="flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            </Alert>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-base-300 p-4 bg-base-100">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={textInput.placeholder.text}
                disabled={!isReady || isTyping}
                className="input input-bordered w-full pr-12 focus:input-primary"
                maxLength={requestBodyLimits.maxMessages * 100} // Rough estimate
              />
              {inputValue.length > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge variant="ghost" size="xs">
                    {inputValue.length}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="primary"
            size="medium"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isReady || isTyping}
            className="px-6"
          >
            {isTyping ? (
              <Loading size="sm" />
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
                Send
              </>
            )}
          </Button>
        </div>

        {/* Status and Limits */}
        <div className="flex justify-between items-center mt-3 text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            {!isReady && (
              <Badge variant="warning" size="xs">
                Disconnected
              </Badge>
            )}
            {isReady && (
              <Badge variant="success" size="xs">
                Connected
              </Badge>
            )}
          </div>
          <div>
            {messages.length}/{requestBodyLimits.maxMessages} messages
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ChatTabViewProps {
  availableProviders: string[];
  selectedProvider: string;
  isReady: boolean;
  introMessage: { text: string };
  textInput: { placeholder: { text: string } };
  requestBodyLimits: { maxMessages: number };
  history: Array<{ role: 'user' | 'ai'; text: string }>;
  connect: {
    handler: (
      body: { messages?: Array<{ text?: string }> },
      signals: { onResponse: (payload: { text?: string; error?: string }) => void }
    ) => void;
  };
}

export function ChatTabView({
  availableProviders,
  selectedProvider,
  isReady,
  introMessage,
  textInput,
  requestBodyLimits,
  history,
  connect,
}: ChatTabViewProps) {
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const providerIcons = {
    google: '🤖',
    openai: '🧠',
    anthropic: '🦾',
    cohere: '🌊',
  };

  const getProviderStatus = () => {
    // Mock status - in real app this would come from the service
    return Math.random() > 0.5 ? 'online' : 'offline';
  };

  const getProviderColor = (status: string) => {
    return status === 'online' ? 'success' : 'warning';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar */}
      <div className="lg:w-80 space-y-4">
        {/* Provider Status Card */}
        <Card variant="bordered" className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🔗</span>
              AI Providers
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {availableProviders.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-sm text-base-content/70">No providers configured</p>
              </div>
            ) : (
              availableProviders.map((provider) => {
                const status = getProviderStatus();
                return (
                  <div
                    key={provider}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedProvider === provider
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-base-content/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {providerIcons[provider as keyof typeof providerIcons] || '🤖'}
                      </span>
                      <div>
                        <div className="font-medium capitalize">{provider}</div>
                        <div className="text-xs text-base-content/60">
                          {selectedProvider === provider ? 'Active' : 'Available'}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getProviderColor(status)} size="xs" className="capitalize">
                      {status}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardBody>
          <CardActions>
            <Button
              variant="outline"
              size="small"
              className="w-full"
              onClick={() => setShowProviderModal(true)}
            >
              ⚙️ Configure Providers
            </Button>
          </CardActions>
        </Card>

        {/* Chat Stats Card */}
        <Card variant="compact" className="shadow-md">
          <CardBody>
            <div className="stats stats-vertical lg:stats-horizontal w-full">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    className="inline-block w-8 h-8 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Messages</div>
                <div className="stat-value text-lg">{history.length}</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg
                    className="inline-block w-8 h-8 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Provider</div>
                <div className="stat-value text-sm">{selectedProvider || 'None'}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            <Button
              variant="ghost"
              size="small"
              className="w-full justify-start"
              onClick={() => setShowHistory(!showHistory)}
            >
              📚 {showHistory ? 'Hide' : 'Show'} History
            </Button>
            <Button
              variant="ghost"
              size="small"
              className="w-full justify-start"
              disabled={!isReady}
            >
              🗑️ Clear Chat
            </Button>
            <Button
              variant="ghost"
              size="small"
              className="w-full justify-start"
              disabled={!isReady}
            >
              💾 Export Chat
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-base-100/50 backdrop-blur-sm rounded-lg p-4 border border-base-300">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isReady ? 'bg-success' : 'bg-warning'} animate-pulse`}
            ></div>
            <span className="font-medium">{isReady ? 'Connected' : 'Connecting...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">{history.length} messages</span>
            <div className="divider divider-horizontal"></div>
            <Button variant="ghost" size="small">
              ⋮
            </Button>
          </div>
        </div>

        {/* Chat History Preview */}
        {showHistory && history.length > 0 && (
          <Card variant="compact" className="max-h-48 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm">Recent Messages</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {history.slice(-5).map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 text-sm ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200'
                    }`}
                  >
                    <div className="font-medium text-xs mb-1">
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </div>
                    {msg.text.length > 50 ? `${msg.text.substring(0, 50)}...` : msg.text}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Main Chat Interface */}
        <Card variant="bordered" className="flex-1 shadow-lg">
          <CardBody className="p-0 h-full">
            {availableProviders.length === 0 ? (
              <div className="hero min-h-[400px] bg-gradient-to-br from-base-200 to-base-100">
                <div className="hero-content text-center">
                  <div className="max-w-md">
                    <div className="text-6xl mb-4 animate-bounce">💬</div>
                    <h1 className="text-2xl font-bold">Chat Unavailable</h1>
                    <p className="py-6 text-base-content/70">
                      Configure an AI provider in Settings to enable chat
                    </p>
                    <Button variant="primary" onClick={() => setShowProviderModal(true)}>
                      Configure Providers
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Connection Status */}
                <div className="p-4 border-b border-base-300">
                  <Alert
                    variant={isReady ? 'success' : 'warning'}
                    title="AI Connection Status"
                    icon={isReady ? '🟢' : '🔴'}
                  >
                    <div className="text-sm space-y-1">
                      <div>
                        Provider:{' '}
                        <span className="badge badge-outline font-mono">
                          {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
                        </span>
                      </div>
                      <div>
                        {isReady ? '✅ AI provider ready' : '❌ AI provider not configured'}
                      </div>
                      {!isReady && (
                        <div className="mt-2">
                          Configure your AI provider in the Settings tab to enable chat
                          functionality.
                        </div>
                      )}
                    </div>
                  </Alert>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 min-h-[400px]">
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full bg-base-200/50">
                        <Loading size="lg" text="Loading chat interface..." />
                      </div>
                    }
                  >
                    <DaisyUIChat
                      introMessage={introMessage}
                      textInput={textInput}
                      requestBodyLimits={requestBodyLimits}
                      history={history}
                      connect={connect}
                      isReady={isReady}
                    />
                  </React.Suspense>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Provider Configuration Modal */}
      <Modal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        title="AI Provider Configuration"
        size="lg"
      >
        <div className="space-y-4">
          <Alert variant="info">
            Configure your AI providers in the Settings tab to enable chat functionality.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['google', 'openai', 'anthropic', 'cohere'].map((provider) => (
              <Card key={provider} variant="bordered" hover>
                <CardBody className="text-center">
                  <div className="text-3xl mb-2">
                    {providerIcons[provider as keyof typeof providerIcons]}
                  </div>
                  <h3 className="font-bold capitalize">{provider}</h3>
                  <p className="text-sm text-base-content/70 mb-4">
                    {provider === 'google' && 'Gemini AI models'}
                    {provider === 'openai' && 'GPT models'}
                    {provider === 'anthropic' && 'Claude models'}
                    {provider === 'cohere' && 'Command models'}
                  </p>
                  <Badge
                    variant={availableProviders.includes(provider) ? 'success' : 'warning'}
                    size="sm"
                  >
                    {availableProviders.includes(provider) ? 'Configured' : 'Not Set'}
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <ModalActions>
          <Button variant="ghost" onClick={() => setShowProviderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowProviderModal(false)}>
            Go to Settings
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
