'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneralAssistantViewProps {
  onSendMessage: (message: string, tool: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function GeneralAssistantView({ onSendMessage, isLoading, className }: GeneralAssistantViewProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your General Assistant. I can help you with a wide variety of tasks including answering questions, providing explanations, helping with coding, planning, and much more. What would you like me to help you with today?',
      timestamp: new Date()
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage(message, 'general');
    setMessage('');
  };

  const examplePrompts = [
    'Explain quantum computing in simple terms',
    'Help me plan a weekend trip to Paris',
    'Write a Python function to sort an array',
    'What are the best practices for web development?'
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCpu className="w-4 h-4 text-white" />
              </div>
            )}
            
            <Card className={`max-w-2xl p-3 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </Card>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCpu className="w-4 h-4 text-white" />
            </div>
            <Card className="bg-white p-3">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Example Prompts */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Try asking me about:</p>
          <div className="grid grid-cols-2 gap-2">
            {examplePrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setMessage(prompt)}
                className="text-left h-auto p-2 text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="min-h-[40px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || isLoading}
            className="self-end"
          >
            <FiSend className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}