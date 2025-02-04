import React from 'react';
import { Terminal, Trash2, History } from 'lucide-react';

interface LogMessage {
  id: string;
  timestamp: number;
  direction: 'in' | 'out';
  event: string;
  data: any;
}

interface WSLoggerProps {
  title: string;
  maxMessages?: number;
}

export const WSLogger: React.FC<WSLoggerProps> = ({ title, maxMessages = 50 }) => {
  const [messages, setMessages] = React.useState<LogMessage[]>([]);
  const [hiddenMessages, setHiddenMessages] = React.useState<LogMessage[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  // Add a new message to the log
  const addMessage = React.useCallback((direction: 'in' | 'out', event: string, data: any) => {
    setMessages(prev => {
      const newMessages = [
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          direction,
          event,
          data
        },
        ...prev
      ].slice(0, maxMessages);
      return newMessages;
    });
  }, [maxMessages]);

  // Clear visible messages but keep them in hidden state
  const clearMessages = () => {
    setHiddenMessages(prev => [...messages, ...prev]);
    setMessages([]);
  };

  // Show all messages including hidden ones
  const showAllMessages = () => {
    setMessages(prev => [...prev, ...hiddenMessages]);
    setHiddenMessages([]);
  };

  // Expose the addMessage function globally for the socket handlers
  React.useEffect(() => {
    const key = `ws-logger-${title.toLowerCase().replace(/\s+/g, '-')}`;
    (window as any)[key] = { addMessage };
    return () => {
      delete (window as any)[key];
    };
  }, [title, addMessage]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (logContainerRef.current && isExpanded) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [messages, isExpanded]);

  const hasHiddenMessages = hiddenMessages.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4" />
          <h3 className="font-medium">WS Logs</h3>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearMessages();
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Clear messages"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {hasHiddenMessages && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showAllMessages();
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Show all messages"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs text-gray-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
            {hasHiddenMessages && ` (${hiddenMessages.length} hidden)`}
          </span>
        </div>
      </div>

      {/* Log Content */}
      {isExpanded && (
        <div 
          ref={logContainerRef}
          className="h-96 overflow-y-auto border-t border-gray-700 text-sm font-mono"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className="p-2 border-b border-gray-800 hover:bg-gray-800"
            >
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <span className={msg.direction === 'in' ? 'text-green-400' : 'text-blue-400'}>
                  {msg.direction === 'in' ? '← Received' : '→ Sent'}
                </span>
              </div>
              <div className="text-gray-300">{msg.event}</div>
              <pre className="mt-1 text-xs text-gray-400 overflow-x-auto">
                {JSON.stringify(msg.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};