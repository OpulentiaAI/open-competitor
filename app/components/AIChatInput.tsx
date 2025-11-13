import React, { useState, useRef, useEffect } from 'react';
import { Plus, Settings, Mic, Send, MoreHorizontal, ChevronDown, User, Wrench, Paperclip, Loader2 } from 'lucide-react';

type AIChatInputProps = {
  placeholder?: string;
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
};

// @component: AIChatInput
export const AIChatInput = ({
  placeholder = "Ask anything, create anything",
  onSubmit,
  isLoading = false
}: AIChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(42, Math.min(scrollHeight, 200))}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit?.(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
    <div className="w-full md:min-w-[760px] md:w-[760px] mt-3 bg-white border border-gray-200 overflow-visible rounded-[24px] shadow-[0px_6px_30px_0px_rgba(0,0,0,0.08)]">
      <div className="px-3 pb-3 cursor-text relative z-[1] rounded-2xl flex flex-col overflow-visible">
        <div className="flex flex-col pt-3 relative z-10 overflow-visible">
          <textarea 
            ref={textareaRef} 
            name="query" 
            className="h-[42px] w-full resize-none border-0 bg-transparent text-base text-[#232425] placeholder:text-[#909499] focus:outline-none font-[arial,sans-serif] transition-colors duration-1000 ease-in-out" 
            placeholder={placeholder} 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onFocus={() => setIsFocused(true)} 
            onBlur={() => setIsFocused(false)} 
            rows={1} 
          />
          <div className="flex items-center justify-between relative overflow-visible bg-white">
            <div className="flex items-center gap-2">
              {/* User Icon */}
              <div className="flex items-center justify-center rounded-md cursor-pointer text-sm text-[#909499] hover:text-[#232425]">
                <div className="flex items-center justify-center h-9 w-9 border border-[#efefef] rounded-full hover:bg-[#f0f0f0] transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </div>
              
              {/* Tools Section with More Menu */}
              <div className="flex items-center justify-center relative transition-all duration-200 ease-out overflow-visible" ref={moreMenuRef}>
                <div 
                  className="flex items-center relative gap-1 cursor-pointer h-9 border border-[#efefef] rounded-[32px] px-3 transition-all duration-200 ease-out hover:bg-[#f0f0f0]"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                >
                  <div className="flex-shrink-0 relative overflow-hidden h-5 w-5 max-h-5 max-w-5">
                    <Wrench className="h-5 w-5 text-[#909499]" />
                  </div>
                  <img 
                    src="https://www.genspark.ai/_nuxt/deepwiki_icon.BiOEdBz-.png" 
                    alt="Tool Icon" 
                    className="flex-shrink-0 object-contain h-5 w-5 max-h-5 max-w-5" 
                  />
                  <div className="text-[#909499] text-xs font-medium px-1">+1</div>
                </div>

                {/* Dropdown Menu */}
                {isMoreMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-56 rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.12)] py-2 z-50">
                    <input ref={fileInputRef} className="hidden" multiple type="file" />
                    
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
            </div>
            
            <div className="flex items-center gap-4 flex-grow justify-end">
              <div className="flex items-center text-[#909499]">
                <div className="flex items-center">
                  <div className="relative">
                    <div 
                      className="w-5 h-5 p-2 hover:bg-[#f0f0f0] hover:text-[#232425] hover:rounded-[35%] flex items-center justify-center cursor-pointer transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-5 h-5 text-[#909499]" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-2 rounded-[35%] hover:bg-[#f0f0f0] cursor-pointer transition-colors">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-center flex-shrink-0 text-white ml-2">
                  <button
                    type="button"
                    disabled={!message.trim() || isLoading}
                    className={
                      !message.trim() || isLoading
                        ? "bg-[#d1d5db] rounded-[35%] text-[#6b7280] w-9 h-9 flex items-center justify-center cursor-not-allowed transition-colors"
                        : "bg-[#232425] rounded-[35%] text-white w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-[#3a3b3d] transition-colors"
                    }
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        className="w-9 h-3.5 flex items-center justify-center" 
                        fill="none"
                      >
                        <g fill="none">
                          <path 
                            d="M4.75 3A1.75 1.75 0 0 0 3 4.75v14.5c0 .966.784 1.75 1.75 1.75h14.5A1.75 1.75 0 0 0 21 19.25V4.75A1.75 1.75 0 0 0 19.25 3H4.75z" 
                            fill="currentColor" 
                          />
                        </g>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
