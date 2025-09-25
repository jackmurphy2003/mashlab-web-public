import React, { useState, useRef, useEffect } from 'react';
import { LabState } from '../../state/useCopilot';
import ClarifierChips from './ClarifierChips';

const colors = {
  bg: "#0c1020",
  surface: "#141a33",
  accentPrimary: "#7aa7ff",
  accentSecondary: "#9a6bff",
  text: "#E8EEFF",
  muted: "#9AA6C3",
};

interface ChatPanelProps {
  state: LabState;
  actions: {
    submitPrompt: (text: string) => Promise<void>;
    answerClarifier: (field: string, value: any) => Promise<void>;
    brew: () => Promise<void>;
  };
}

export default function ChatPanel({ state, actions }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      if (state.phase === 'idle') {
        await actions.submitPrompt(message);
      } else if (state.phase === 'clarify') {
        await actions.submitPrompt(message);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    switch (state.phase) {
      case 'idle': return 'Type your brief… e.g., 2-hour college house party, open format, hype peaks';
      case 'clarify': return 'Tell me more about your preferences...';
      case 'brewing': return 'Brewing your set...';
      case 'ready': return 'Ask for adjustments or start a new set';
      default: return 'Type a message...';
    }
  };

  return (
    <div className="chat-panel flex flex-col h-full">
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(12,16,32,0.8)'
        }}
      >
        <h2 
          className="text-lg font-semibold"
          style={{ color: colors.text }}
        >
          Co-Pilot
        </h2>
      </div>

      {/* Clarifiers */}
      {state.phase === 'clarify' && state.missing.length > 0 && (
        <div className="chat-clarifiers p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <ClarifierChips 
            missing={state.missing}
            brief={state.brief}
            onAnswer={actions.answerClarifier}
          />
        </div>
      )}

      {/* Messages */}
      <div className="chat-thread flex-1 overflow-auto p-3 space-y-4">
        {state.messages.length === 0 && (
          <div 
            className="text-center py-8"
            style={{ color: colors.muted }}
          >
            Tell me about your party and I'll brew a flow-ready set.
          </div>
        )}
        
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'rounded-br-sm' 
                  : 'rounded-bl-sm'
              }`}
              style={{
                backgroundColor: message.type === 'user' 
                  ? colors.accentPrimary 
                  : 'rgba(255,255,255,0.1)',
                color: message.type === 'user' ? '#000' : colors.text
              }}
            >
              <p className="text-sm">{message.content}</p>
              <div 
                className="text-xs mt-1 opacity-70"
                style={{ color: message.type === 'user' ? '#000' : colors.muted }}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] rounded-lg rounded-bl-sm p-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: colors.text
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Auto-brew button */}
      {state.phase === 'clarify' && state.missing.length === 0 && (
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={actions.brew}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.accentPrimary,
              color: '#000'
            }}
          >
            🧪 Brew Set
          </button>
        </div>
      )}

      {/* Input */}
      <div 
        className="chat-composer p-3 border-t"
        style={{ 
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(12,16,32,0.8)',
          backdropFilter: 'blur(6px)'
        }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={state.phase === 'brewing'}
            className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.2)',
              color: colors.text
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || state.phase === 'brewing'}
            className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: colors.accentSecondary,
              color: colors.text
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
