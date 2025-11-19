'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import {
  FiSend, FiPaperclip, FiSliders, FiGrid, FiMessageSquare, FiStar,
  FiImage, FiVideo, FiSearch, FiPhone, FiDownload, FiArrowRight,
  FiBox, FiPlus, FiChevronDown, FiLoader, FiLink, FiCheck, FiX, FiEye, FiEyeOff,
  FiCheckSquare, FiFileText, FiYoutube
} from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SlidePreview from './SlidePreview';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { GlowCard } from '@/components/ui/spotlight-card';
import { HyperText } from '@/components/ui/hyper-text';
import ToolbarExpandable from './ToolbarExpandable';
import { AIChatInput } from './AIChatInput';
import { InlineArtifactCard as ArtifactCard } from '@/components/artifacts/InlineArtifactCard';
import { ArtifactPanel } from '@/components/artifacts/ArtifactPanel';
import { RelatedContent } from '@/components/chat/RelatedContent';
import MessageFeedback from './MessageFeedback';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export interface Slide {
  title: string;
  content: string;
  type: 'title' | 'content' | 'bullet';
  bulletPoints?: string[];
  html?: string;
}

interface Message {
  _id: Id<"messages">;
  role: 'user' | 'assistant';
  content: string;
  _creationTime: number;
  slideData?: Slide[];
  hasSlides?: boolean;
  toolName?: string;
  toolArgs?: any;
  relatedContent?: { id: string; title: string; type: string; url?: string; }[];
}

interface SuperAgentProps {
  className?: string;
  userId: string | null;
}

const agentTools = [
  { id: 'general', name: 'General Assistant', icon: FiMessageSquare },
  { id: 'slides', name: 'Presentation Creator', icon: FiSliders },
  { id: 'search', name: 'Web Search', icon: FiSearch },
  { id: 'images', name: 'Image Generator', icon: FiImage },
  { id: 'videos', name: 'Video Creator', icon: FiVideo },
  { id: 'calls', name: 'Phone Calls', icon: FiPhone },
  { id: 'files', name: 'File Manager', icon: FiPaperclip },
];

// ArtifactCard replaced by imported InlineArtifactCard


const WelcomeScreen = ({ onPromptSelect }: { onPromptSelect: (prompt: string) => void }) => {
  const examplePrompts = [
    'Create a 5-slide presentation about the future of AI',
    'Summarize the latest trends in renewable energy',
    'Write a short story about a robot who discovers music',
    'Generate a logo for a coffee shop named "The Daily Grind"',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">


      <div className="mb-2">
        <HyperText text="MealOutpost SuperAgent" className="text-8xl font-bold" />
      </div>
      <p className="text-gray-500 mb-8 max-w-md">Powered by Opulentia & Composio - Your creative partner for generating content, slides, and more.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {examplePrompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            onClick={() => onPromptSelect(prompt)}
            className="p-4 bg-white rounded-lg text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 hover:shadow-md"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

import { ThinkingBlock } from './ThinkingBlock';

const MessageBubble = ({ message, activeSlide, setActiveSlide, downloadAsPPT, artifacts }: {
  message: Message;
  activeSlide: number;
  setActiveSlide: (slide: number) => void;
  downloadAsPPT: () => void;
  artifacts?: any[];
}) => {
  // Find artifacts related to this message
  const messageArtifacts = artifacts?.filter(a => {
    // Match artifacts created around the same time as the message
    const timeDiff = Math.abs(a.createdAt - message._creationTime);
    return timeDiff < 30000; // Within 30 seconds
  }) || [];
  
  // Extract text content from message (handle both string and array formats)
  const getMessageText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map(part => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object' && part.type === 'text' && part.text) return part.text;
          return '';
        })
        .join('\n');
    }
    if (content && typeof content === 'object') {
      if (content.type === 'text' && content.text) return content.text;
    }
    return String(content ?? '');
  };
  
  const fullText = getMessageText(message.content);
  
  // Parse <think> tags
  // Case 1: Complete <think>...</think> block
  // Case 2: Open <think>... (streaming)
  let thinkingContent = '';
  let displayContent = fullText;
  let isThinkingStream = false;

  const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/;
  const match = fullText.match(thinkRegex);

  if (match) {
    thinkingContent = match[1];
    // Remove the thinking block from the display text
    displayContent = fullText.replace(match[0], '').trim();
    
    // Check if the tag is closed
    if (!fullText.includes('</think>')) {
      isThinkingStream = true;
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx('flex items-start gap-4 max-w-4xl', message.role === 'user' ? 'justify-end ml-auto' : 'justify-start')}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FiStar className="w-4 h-4 text-white" />
        </div>
      )}
      
      <GlowCard glowColor={message.role === 'user' ? 'blue' : 'purple'} className="min-w-0 w-auto h-auto !aspect-auto !h-auto !min-h-0 !p-2 !py-2 !px-4 !shadow-none">
        {message.role === 'assistant' ? (
          <div className="prose prose-sm max-w-none text-gray-800">
            {thinkingContent && (
              <ThinkingBlock content={thinkingContent} isThinking={isThinkingStream} />
            )}
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                )
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{displayContent}</p>
        )}
        
        {message.hasSlides && message.slideData && message.slideData.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1h-2a1 1 0 01-1-1V4m0 0H8m8 0v2H8V4" />
              </svg>
              Presentation Preview
            </h3>
            <div 
              className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200 h-120"
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' && activeSlide > 0) {
                  setActiveSlide(activeSlide - 1);
                } else if (e.key === 'ArrowRight' && activeSlide < message.slideData!.length - 1) {
                  setActiveSlide(activeSlide + 1);
                }
              }}
              tabIndex={0}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-h-130 bg-white rounded-lg overflow-y-auto overflow-x-hidden"
                  style={{ minHeight: '300px' }}
                >
                  {message.slideData[activeSlide] && message.slideData[activeSlide].html ? (
                    <div 
                      className="w-full h-120 p-4"
                      dangerouslySetInnerHTML={{ __html: message.slideData[activeSlide].html! }}
                    />
                  ) : (
                    <div className="p-4">
                      {message.slideData[activeSlide] ? (
                        <SlidePreview slide={message.slideData[activeSlide]} index={activeSlide} isSelected={true} onClick={()=>{}} />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
                          <p className="ml-4 text-gray-500">Generating slide content...</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-600">Slide {activeSlide + 1} of {message.slideData.length}</p>
                <div className="flex bg-gray-100 rounded-full p-1">
                  {message.slideData.map((_, index) => (
                    <button
                      key={`slide-dot-${message._id}-${index}`}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`w-2 h-2 rounded-full mx-0.5 transition-all duration-200 ${
                        index === activeSlide ? 'bg-blue-500 w-4' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                  disabled={activeSlide === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide(Math.min(message.slideData!.length - 1, activeSlide + 1))}
                  disabled={activeSlide === message.slideData.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={downloadAsPPT}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FiDownload className="w-4 h-4" />
                  Download PPT
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Artifact Rendering */}
        {message.role === 'assistant' && messageArtifacts.length > 0 && (
          <div className="mt-4 space-y-3">
            {messageArtifacts.map((artifact) => (
              <ArtifactCard key={artifact._id} artifact={artifact} />
            ))}
          </div>
        )}

        {/* Related Content */}
        {message.relatedContent && message.relatedContent.length > 0 && (
          <RelatedContent 
            items={message.relatedContent} 
            onItemClick={(item) => window.open(item.url, '_blank')}
          />
        )}
        
        {/* Message Feedback for Assistant Messages */}
        {message.role === 'assistant' && (
          <MessageFeedback
            messageId={message._id}
            onRatingChange={(rating: number) => console.log('Rating:', rating)}
            onGenerateQR={() => console.log('Generate QR')}
          />
        )}
      </GlowCard>
      
      {message.role === 'user' && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-gray-600">You</span>
        </div>
      )}
    </motion.div>
  );
};

export default function SuperAgent({ className, userId }: SuperAgentProps) {
  const [prompt, setPrompt] = useState('');
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(null);
  const [selectedTool, setSelectedTool] = useState(agentTools[0]);
  const [isToolSelectorOpen, setIsToolSelectorOpen] = useState(false);
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showArtifacts, setShowArtifacts] = useState(false);

  // Convex hooks
  const startThread = useMutation(api.chat_superagent.startThread);
  const sendMessage = useMutation(api.chat_superagent.sendMessage);
  const messages = useQuery(
    api.chat_superagent.listMessages,
    threadId ? { threadId } : "skip"
  );
  const artifacts = useQuery(
    api.artifacts_queries.listByThread,
    threadId ? { threadId } : "skip"
  );

  const isLoading = threadId !== null && messages === undefined;
  
  // Check if assistant is currently thinking
  // True if: last message is user (waiting for assistant response) OR last message is assistant with pending status
  const isThinking = messages && messages.length > 0 && (
    (messages[messages.length - 1].role === 'user' && messages[messages.length - 1].status === 'success') ||
    (messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].status === 'pending')
  );

  // Debug logging for messages
  useEffect(() => {
    console.log('[SuperAgent] State update - threadId:', threadId, 'messages:', messages, 'isLoading:', isLoading, 'isThinking:', isThinking);
    if (messages && messages.length > 0) {
      console.log('[SuperAgent] First message structure:', JSON.stringify(messages[0], null, 2));
      console.log('[SuperAgent] Last message:', JSON.stringify(messages[messages.length - 1], null, 2));
    }
  }, [threadId, messages, isLoading, isThinking]);

  // Spreadsheet state
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [isSheetConnected, setIsSheetConnected] = useState(false);
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  
  // Google Docs state
  const [docUrl, setDocUrl] = useState('');
  const [docId, setDocId] = useState('');
  const [isDocConnected, setIsDocConnected] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(500); // Default wider width
  const [isResizing, setIsResizing] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Spreadsheet helper functions
  const validateSheetUrl = (url: string): boolean => {
    const googleSheetsRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return googleSheetsRegex.test(url);
  };

  const extractSheetId = (url: string): string => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    const id = extractSheetId(url);
    return `https://docs.google.com/spreadsheets/d/${id}/edit?usp=sharing&widget=true&headers=false`;
  };

  const detectSpreadsheetUrl = (text: string): string | null => {
    const googleSheetsRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+[^\s]*/g;
    const match = text.match(googleSheetsRegex);
    return match ? match[0] : null;
  };

  // Google Docs helper functions
  const validateDocUrl = (url: string): boolean => {
    const googleDocsRegex = /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/;
    return googleDocsRegex.test(url);
  };

  const extractDocId = (url: string): string => {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const getDocEmbedUrl = (url: string): string => {
    if (!url) return '';
    const id = extractDocId(url);
    return `https://docs.google.com/document/d/${id}/edit?usp=sharing&widget=true&headers=false`;
  };

  const detectDocumentUrl = (text: string): string | null => {
    const googleDocsRegex = /https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+[^\s]*/g;
    const match = text.match(googleDocsRegex);
    return match ? match[0] : null;
  };

  const handleExamplePrompt = (p: string) => {
    setPrompt(p);
    inputRef.current?.focus();
  };

  // Convex-based submit handler
  const handleSubmit = async (message?: string, e?: React.FormEvent) => {
    console.log('[SuperAgent] handleSubmit START - message:', message, 'prompt:', prompt, 'isLoading:', isLoading);
    if (e) e.preventDefault();
    const msg = (typeof message === 'string' ? message : prompt).trim();
    console.log('[SuperAgent] msg after trim:', msg, 'isLoading:', isLoading);
    if (!msg || isLoading) {
      console.log('[SuperAgent] EARLY RETURN - msg:', msg, 'isLoading:', isLoading);
      return;
    }

    // Check if the prompt contains a spreadsheet or doc URL
    const detectedSheetUrl = detectSpreadsheetUrl(msg);
    const detectedDocUrl = detectDocumentUrl(msg);

    // Handle sidebar display
    if (detectedSheetUrl && validateSheetUrl(detectedSheetUrl)) {
      setSheetUrl(detectedSheetUrl);
      setSheetId(extractSheetId(detectedSheetUrl));
      setIsSheetConnected(true);
      setShowSpreadsheet(true);
      setShowDocument(false);
    } else if (detectedDocUrl && validateDocUrl(detectedDocUrl)) {
      setDocUrl(detectedDocUrl);
      setDocId(extractDocId(detectedDocUrl));
      setIsDocConnected(true);
      setShowDocument(true);
      setShowSpreadsheet(false);
    }

    setPrompt('');

    console.log('[SuperAgent] Submitting message:', msg);
    console.log('[SuperAgent] Current threadId:', threadId);
    
    try {
      if (!threadId) {
        // Start new thread
        console.log('[SuperAgent] Starting new thread...');
        const result = await startThread({
          userId: userId || 'anonymous',
          prompt: msg,
        });
        console.log('[SuperAgent] Thread started:', result);
        setThreadId(result.threadId as Id<"threads">);
      } else {
        // Send message to existing thread
        console.log('[SuperAgent] Sending message to existing thread...');
        await sendMessage({
          threadId,
          userId: userId || 'anonymous',
          prompt: msg,
        });
        console.log('[SuperAgent] Message sent successfully');
      }
    } catch (error) {
      console.error('[SuperAgent] Error sending message:', error);
      alert('Failed to send message. Check console for details.');
    }
  };

  const downloadAsPPT = async () => {
    if (currentSlides.length === 0) return;

    try {
      const response = await fetch('/api/convert-to-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: currentSlides,
          title: 'AI Generated Presentation',
          userId: userId,
          style: 'professional', // Default to professional style
        }),
      });

      if (!response.ok) throw new Error('Failed to convert to PowerPoint');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading presentation:', error);
    }
  };


  const disconnectSpreadsheet = () => {
    setIsSheetConnected(false);
    setSheetUrl('');
    setSheetId('');
    setShowSpreadsheet(false);
  };

  const disconnectDocument = () => {
    setIsDocConnected(false);
    setDocUrl('');
    setDocId('');
    setShowDocument(false);
  };

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      // Constrain width between 300px and 80% of window width
      const minWidth = 300;
      const maxWidth = window.innerWidth * 0.8;
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp); // Also handle mouse leave
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className={clsx('flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative', className)}>
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col max-w-full">
        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          {!messages || messages.length === 0 ? (
            <WelcomeScreen onPromptSelect={handleExamplePrompt} />
          ) : (
            <ChatMessageList smooth className="px-4 py-6 space-y-6">
              {messages.map((message: any) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  activeSlide={activeSlide}
                  setActiveSlide={setActiveSlide}
                  downloadAsPPT={downloadAsPPT}
                  artifacts={artifacts}
                />
              ))}
              
              {(isLoading || isThinking) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4 max-w-4xl"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiLoader className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-bl-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm font-medium">{isThinking ? 'Thinking...' : 'Loading messages...'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </ChatMessageList>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
            {/* Top Controls Row - Tool Selector and Toolbar unified */}
            <div className="w-full flex items-center justify-start gap-1">
              {/* Unified Control Container */}
              <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                {/* Tool Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsToolSelectorOpen(!isToolSelectorOpen)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50 transition-all text-[10px] font-medium text-gray-600"
                  >
                    <selectedTool.icon className="w-3 h-3 text-gray-600" />
                    <span className="font-sans">{selectedTool.name}</span>
                    <FiChevronDown className={clsx(
                      "w-2.5 h-2.5 transition-transform",
                      isToolSelectorOpen && "rotate-180"
                    )} />
                  </button>
                  
                  <AnimatePresence>
                    {isToolSelectorOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 min-w-[180px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                      >
                        {agentTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => {
                                setSelectedTool(tool);
                                setIsToolSelectorOpen(false);
                              }}
                              className={clsx(
                                'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors font-sans text-xs',
                                selectedTool.id === tool.id
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'hover:bg-gray-50 text-gray-700'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-medium">{tool.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-gray-200" />

                {/* Expandable Toolbar - Integrated */}
                <div className="scale-[0.65] origin-center -mx-1">
                  <ToolbarExpandable />
                </div>

                {/* Artifacts Toggle */}
                {artifacts && artifacts.length > 0 && (
                  <>
                    <div className="h-6 w-px bg-gray-200" />
                    <button
                      type="button"
                      onClick={() => setShowArtifacts(!showArtifacts)}
                      className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-md transition-all text-[10px] font-medium",
                        showArtifacts ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-600"
                      )}
                    >
                      <FiBox className="w-3 h-3" />
                      <span className="font-sans">Artifacts ({artifacts.length})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <AIChatInput
              onSubmit={(message) => {
                console.log('[SuperAgent] AIChatInput onSubmit callback fired with:', message);
                handleSubmit(message);
              }}
              placeholder="Ask MealOutpost SuperAgent anything or paste a Google Sheets/Docs URL..."
              isLoading={isLoading}
            />
            
            <p className="text-xs text-center text-gray-400 mt-2 font-sans">
              MealOutpost SuperAgent can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Spreadsheet/Document/Artifact Sidebar */}
      {(showSpreadsheet || showDocument || showArtifacts) && (
        <AnimatePresence>
          {/* Artifact Panel Sidebar */}
          {showArtifacts && artifacts && (
             <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full bg-white shadow-2xl border-l border-gray-200 z-30"
              style={{ width: `${sidebarWidth}px` }}
            >
              {/* Resize Handle */}
               <div
                role="separator"
                aria-label="Resize artifacts sidebar"
                aria-orientation="vertical"
                tabIndex={0}
                className={clsx(
                  "absolute left-0 top-0 bottom-0 w-1 hover:bg-blue-400 cursor-col-resize z-40 transition-colors",
                  isResizing && "bg-blue-400"
                )}
                onMouseDown={handleMouseDown}
              />
              
              <ArtifactPanel 
                artifacts={artifacts} 
                onClose={() => setShowArtifacts(false)}
                title="Thread Artifacts"
                className="h-full w-full"
              />
            </motion.div>
          )}

          {/* Spreadsheet Sidebar */}
          {showSpreadsheet && isSheetConnected && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full bg-white shadow-2xl border-l border-gray-200 flex z-20"
              style={{ width: `${sidebarWidth}px` }}
            >
              {/* Resize Handle */}
              <div
                role="separator"
                aria-label="Resize spreadsheet sidebar"
                aria-orientation="vertical"
                tabIndex={0}
                className={clsx(
                  "w-2 h-full bg-gray-100 hover:bg-gray-200 cursor-col-resize flex items-center justify-center group border-r border-gray-200 transition-colors",
                  isResizing && "bg-blue-200"
                )}
                onMouseDown={handleMouseDown}
              >
                <div className="w-0.5 h-8 bg-gray-400 group-hover:bg-gray-600 transition-colors"></div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 flex flex-col">
                {/* Spreadsheet Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Connected Spreadsheet</h2>
                    <button
                      type="button"
                      onClick={disconnectSpreadsheet}
                      aria-label="Disconnect spreadsheet"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FiCheck className="w-4 h-4" />
                    <span>Connected to Google Sheets</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {sheetUrl}
                  </p>
                </div>

                {/* Spreadsheet View */}
                <div className="flex-1 bg-gray-50">
                  <iframe
                    src={getEmbedUrl(sheetUrl)}
                    className="w-full h-full border-0"
                    title="Google Sheets"
                    allow="fullscreen"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Google Docs Sidebar */}
          {showDocument && isDocConnected && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full bg-white shadow-2xl border-l border-gray-200 flex z-20"
              style={{ width: `${sidebarWidth}px` }}
            >
              {/* Resize Handle */}
              <div
                role="separator"
                aria-label="Resize document sidebar"
                aria-orientation="vertical"
                tabIndex={0}
                className={clsx(
                  "w-2 h-full bg-gray-100 hover:bg-gray-200 cursor-col-resize flex items-center justify-center group border-r border-gray-200 transition-colors",
                  isResizing && "bg-blue-200"
                )}
                onMouseDown={handleMouseDown}
              >
                <div className="w-0.5 h-8 bg-gray-400 group-hover:bg-gray-600 transition-colors"></div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 flex flex-col">
                {/* Document Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Connected Document</h2>
                    <button
                      type="button"
                      onClick={disconnectDocument}
                      aria-label="Disconnect document"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <FiCheck className="w-4 h-4" />
                    <span>Connected to Google Docs</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {docUrl}
                  </p>
                </div>

                {/* Document View */}
                <div className="flex-1 bg-gray-50">
                  <iframe
                    src={getDocEmbedUrl(docUrl)}
                    className="w-full h-full border-0"
                    title="Google Docs"
                    allow="fullscreen"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}