import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, CircleFadingPlus, AtSign, ShipWheel, AudioWaveform, ChevronDown, ChevronUp, X, File } from 'lucide-react';

type AIChatInputProps = {
  onSubmit?: (message: string, files?: File[], audioBlob?: Blob) => void;
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0 || audioBlob) {
      onSubmit?.(message, attachedFiles, audioBlob || undefined);
      setMessage('');
      setAttachedFiles([]);
      setAudioBlob(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current && !message) {
      textareaRef.current.textContent = '';
    }
  }, [message]);

  const isDisabled = (!message.trim() && attachedFiles.length === 0 && !audioBlob) || isLoading;

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
      
      {/* File Attachments Display */}
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 border-b border-[#e6e5e3]">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <File className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-900">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Recording Display */}
      {audioBlob && !isRecording && (
        <div className="px-4 py-2 border-b border-[#e6e5e3]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
            <AudioWaveform className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-900">Audio recorded</span>
            <button
              type="button"
              onClick={() => setAudioBlob(null)}
              className="ml-auto hover:bg-purple-100 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-purple-600" />
            </button>
          </div>
        </div>
      )}

      <div ref={textareaRef} contentEditable role="textbox" aria-label="Start typing" className="w-full px-4 py-3 text-sm leading-5 text-[#2c2c2b] min-h-[56px] max-h-[180px] overflow-y-auto break-words outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#a19e99]" data-placeholder={placeholder} onInput={handleInput} onKeyDown={handleKeyDown} style={{ whiteSpace: 'break-spaces', wordBreak: 'break-word', caretColor: '#2c2c2b' }} />
      <div className="flex flex-col gap-2 px-3 pb-3 pt-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
              className="flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in hover:bg-gray-100 active:bg-gray-200"
            >
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
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? "Stop recording" : "Start audio recording"}
              className={`flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full transition-colors duration-[0.02s] ease-in ${
                isRecording ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              <AudioWaveform className={`w-5 h-5 ${isRecording ? 'text-red-600 animate-pulse' : 'text-[#8e8b86]'}`} />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isDisabled}
              aria-label="Send"
              className={`flex items-center justify-center flex-shrink-0 h-9 w-9 rounded-full transition-all duration-[0.02s] ease-in ${
                isDisabled ? 'bg-[#8e8b86] opacity-40 cursor-default' : 'bg-[#2783de] hover:bg-[#1f6fc0] active:bg-[#1a5ca0] cursor-pointer shadow-md'
              }`}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>;
};
