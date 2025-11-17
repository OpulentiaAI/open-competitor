import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, CircleFadingPlus, AtSign, ShipWheel, AudioWaveform, ChevronDown, ChevronUp } from 'lucide-react';

type AIChatInputProps = {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
};

export const AIChatInput = ({
  onSubmit,
  placeholder = "Ask, search, or make anything…",
  isLoading = false
}: AIChatInputProps = {}) => {
  const [message, setMessage] = useState('');
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const textareaRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSubmit?.(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.textContent = '';
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setMessage(e.currentTarget.textContent || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current && !message) {
      textareaRef.current.textContent = '';
    }
  }, [message]);

  const isDisabled = !message.trim() || isLoading;

  return <div className="w-full bg-white rounded-t-[22px] shadow-[0_-8px_12px_0_rgba(25,25,25,0.027),0_-2px_6px_0_rgba(25,25,25,0.027),0_0_0_1px_rgba(42,28,0,0.07)] border-t-2 border-[#2783de]">
    <div className="flex flex-col max-w-full">
      <div className="border-b border-[#e6e5e3]">
        <button type="button" onClick={() => setIsContextExpanded(!isContextExpanded)} className="flex items-center justify-between w-full h-10 px-4 transition-colors duration-[0.02s] ease-in hover:bg-gray-50 active:bg-gray-100">
          <div className="flex items-center gap-2">
            <AtSign className="w-5 h-5 text-[#8e8b86]" />
            <span className="text-[#7d7a75] text-sm font-medium">Add context</span>
          </div>
          {isContextExpanded ? <ChevronUp className="w-5 h-5 text-[#8e8b86]" /> : <ChevronDown className="w-5 h-5 text-[#8e8b86]" />}
        </button>
        {isContextExpanded && <div className="px-4 pb-3 pt-1 bg-gray-50/50 animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs text-[#a19e99] mb-2">Select context to include in your message</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="flex items-center justify-center h-8 px-3 gap-1.5 rounded-full border border-[#e6e5e3] text-xs font-normal transition-colors duration-[0.02s] ease-in hover:bg-white active:bg-gray-100">
              <AtSign className="w-4 h-4 text-[#8e8b86]" />
              <span className="text-[#7d7a75]">Mention</span>
            </button>
            <button type="button" className="flex items-center justify-center h-8 px-3 gap-1.5 rounded-full border border-[#e6e5e3] text-xs font-normal transition-colors duration-[0.02s] ease-in hover:bg-white active:bg-gray-100">
              <Paperclip className="w-4 h-4 text-[#8e8b86]" />
              <span className="text-[#7d7a75]">Attach file</span>
            </button>
          </div>
        </div>}
      </div>
      <div ref={textareaRef} contentEditable role="textbox" aria-label="Start typing" className="w-full px-4 py-3 text-sm leading-5 text-[#2c2c2b] min-h-[56px] max-h-[180px] overflow-y-auto break-words outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#a19e99]" data-placeholder={placeholder} onInput={handleInput} onKeyDown={handleKeyDown} style={{ whiteSpace: 'break-spaces', wordBreak: 'break-word', caretColor: '#2c2c2b' }} />
      <div className="flex flex-col gap-2 px-3 pb-3 pt-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button type="button" aria-label="Attach file" className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in hover:bg-gray-100 active:bg-gray-200">
              <Paperclip className="w-5 h-5 text-[#8e8b86]" />
            </button>
            <button type="button" aria-label="Agent" className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in hover:bg-gray-100 active:bg-gray-200">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
            </button>
            <button type="button" aria-label="Models" className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in hover:bg-gray-100 active:bg-gray-200">
              <ShipWheel className="w-5 h-5 text-[#7d7a75]" />
            </button>
            <button type="button" aria-label="Connectors" className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in hover:bg-gray-100 active:bg-gray-200">
              <CircleFadingPlus className="w-5 h-5 text-[#8e8b86]" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Audio" className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in hover:bg-gray-100 active:bg-gray-200">
              <AudioWaveform className="w-5 h-5 text-[#8e8b86]" />
            </button>
            <button type="button" onClick={handleSend} disabled={isDisabled} aria-label="Send" className={`flex items-center justify-center flex-shrink-0 h-9 w-9 rounded-full transition-all duration-[0.02s] ease-in ${isDisabled ? 'bg-[#8e8b86] opacity-40 cursor-default' : 'bg-[#2783de] hover:bg-[#1f6fc0] active:bg-[#1a5ca0] cursor-pointer shadow-md'}`}>
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>;
};
