import React, { useState, useRef } from 'react';
import { Plus, Settings, Mic, Send, MoreHorizontal, ChevronDown } from 'lucide-react';

type AIChatInputProps = {
  placeholder?: string;
  onSubmit?: (message: string) => void;
};

// @component: AIChatInput
export const AIChatInput = ({
  placeholder = "Follow up with Opulent...",
  onSubmit
}: AIChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit?.(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMoreMenuOpen]);

  // @return
  return (
    <form 
      onSubmit={handleSubmit} 
      className="rounded-3xl bg-[hsl(240,6%,97%)] font-sans pointer-events-auto flex w-full flex-col p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.04)] transition-all" 
      style={{
        width: '768px',
        maxWidth: '100%'
      }}
    >
      {/* Compact Single-Line Input Container */}
      <div className="shadow-[0_0_0_1px_rgba(0,0,0,0.08)] relative flex w-full items-center gap-2 overflow-visible rounded-xl bg-white px-3 py-2 md:rounded-2xl">
        <input ref={fileInputRef} className="hidden" multiple type="file" />
        
        {/* Grep Icon + Label (compact) */}
        <div className="text-[hsl(240,4%,46%)] flex items-center gap-1.5 shrink-0">
          <svg 
            className="size-4" 
            aria-hidden="true" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M9.5 21H8C6.34315 21 5 19.6569 5 18V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V10M19 19.9495C19.6186 19.3182 20 18.4537 20 17.5C20 15.567 18.433 14 16.5 14C14.567 14 13 15.567 13 17.5C13 19.433 14.567 21 16.5 21C17.4793 21 18.3647 20.5978 19 19.9495ZM19 19.9495L20.5 21.5M9 7H15M9 11H12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <span className="text-xs font-medium animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-[hsl(240,4%,46%)] via-[hsl(240,5%,34%,0.5)] to-[hsl(240,4%,46%)] from-[25%] via-[50%] to-[75%] bg-[length:200%_100%] bg-clip-text text-transparent">
            Grep
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-[hsl(240,6%,90%)] shrink-0" />

        {/* Input Field */}
        <input 
          placeholder={placeholder} 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          onKeyDown={handleKeyDown} 
          className="flex-1 w-full text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-transparent border-none text-[hsl(240,4%,46%)] font-medium placeholder:text-[hsl(240,4%,46%)] placeholder:opacity-60 px-1" 
          type="text" 
        />

        {/* More Options Menu Button */}
        <div className="relative shrink-0" ref={moreMenuRef}>
          <button 
            type="button" 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
            className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none shrink-0 select-none group/button bg-transparent disabled:opacity-55 hover:bg-[hsl(240,6%,93%)] size-8 rounded-md text-[hsl(240,4%,46%)]"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
          
          {/* Dropdown Menu */}
          {isMoreMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.12)] py-2 z-50">
              {/* Plus/Upload Option */}
              <button 
                type="button" 
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsMoreMenuOpen(false);
                }} 
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left"
              >
                <Plus className="size-4 shrink-0" />
                <span className="font-medium">Add Attachment</span>
              </button>
              
              {/* Divider */}
              <div className="h-px bg-[hsl(240,6%,93%)] my-2" />
              
              {/* Model Selector Option */}
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setIsModelMenuOpen(!isModelMenuOpen)} 
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left"
                >
                  <svg 
                    fill="currentColor" 
                    fillRule="evenodd" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="text-[hsl(240,4%,46%)] h-4 w-4 shrink-0"
                  >
                    <title>OpenAI</title>
                    <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
                  </svg>
                  <span className="font-medium flex-1">GPT-5 Codex</span>
                  <ChevronDown className={`size-3.5 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isModelMenuOpen && (
                  <div className="ml-4 py-1">
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left" 
                      onClick={() => setIsModelMenuOpen(false)}
                    >
                      GPT-4 Turbo
                    </button>
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left" 
                      onClick={() => setIsModelMenuOpen(false)}
                    >
                      GPT-3.5
                    </button>
                  </div>
                )}
              </div>
              
              {/* Divider */}
              <div className="h-px bg-[hsl(240,6%,93%)] my-2" />
              
              {/* Settings Option */}
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} 
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left"
                >
                  <Settings className="size-4 shrink-0" />
                  <span className="font-medium flex-1">Settings</span>
                  <ChevronDown className={`size-3.5 transition-transform ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSettingsMenuOpen && (
                  <div className="ml-4 py-1">
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left" 
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      Temperature
                    </button>
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left" 
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      Max Tokens
                    </button>
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left" 
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      Context Length
                    </button>
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[hsl(240,4%,46%)] hover:bg-[hsl(240,6%,97%)] transition-colors text-left" 
                      onClick={() => setIsSettingsMenuOpen(false)}
                    >
                      System Prompt
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Voice Button */}
        <button 
          type="button" 
          className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none shrink-0 select-none group/button bg-transparent disabled:opacity-55 hover:bg-[hsl(240,6%,93%)] size-8 rounded-md text-[hsl(240,4%,46%)]"
        >
          <Mic className="size-4" aria-hidden="true" />
        </button>

        {/* Send Button */}
        <button 
          type="submit" 
          disabled={!message.trim()} 
          className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none shrink-0 select-none group/button bg-[hsl(240,9%,9%)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[hsl(240,9%,15%)] disabled:shadow-none disabled:bg-[hsl(240,6%,85%)] disabled:text-[hsl(240,4%,46%)] disabled:opacity-55 size-8 rounded-md flex-shrink-0"
        >
          <Send className="size-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};
