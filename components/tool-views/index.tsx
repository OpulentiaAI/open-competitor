'use client';

import React from 'react';
import GeneralAssistantView from './GeneralAssistantView';
import WebSearchView from './WebSearchView';
import ImageGeneratorView from './ImageGeneratorView';
import PresentationCreatorView from './PresentationCreatorView';
import VideoCreatorView from './VideoCreatorView';
import PhoneCallsView from './PhoneCallsView';
import FileManagerView from './FileManagerView';

interface ToolViewsProps {
  selectedTool: string;
  isLoading: boolean;
  onSendMessage: (message: string, tool: string) => void;
  onSearch: (query: string) => void;
  onGenerateImage: (prompt: string, style: string) => void;
  onCreatePresentation: (topic: string, slideCount: number, style: string) => void;
  onCreateVideo: (title: string, description: string, style: string) => void;
  onMakeCall: (contactName: string, phoneNumber: string, purpose: string) => void;
  onUploadFile: (file: File) => void;
  onDownloadFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  className?: string;
}

export default function ToolViews({
  selectedTool,
  isLoading,
  onSendMessage,
  onSearch,
  onGenerateImage,
  onCreatePresentation,
  onCreateVideo,
  onMakeCall,
  onUploadFile,
  onDownloadFile,
  onDeleteFile,
  className
}: ToolViewsProps) {
  
  switch (selectedTool) {
    case 'general':
      return (
        <GeneralAssistantView
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          className={className}
        />
      );
      
    case 'slides':
      return (
        <PresentationCreatorView
          onCreatePresentation={onCreatePresentation}
          isLoading={isLoading}
          className={className}
        />
      );
      
    case 'search':
      return (
        <WebSearchView
          onSearch={onSearch}
          isLoading={isLoading}
          className={className}
        />
      );
      
    case 'images':
      return (
        <ImageGeneratorView
          onGenerateImage={onGenerateImage}
          isLoading={isLoading}
          className={className}
        />
      );
      
    case 'videos':
      return (
        <VideoCreatorView
          onCreateVideo={onCreateVideo}
          isLoading={isLoading}
          className={className}
        />
      );
      
    case 'calls':
      return (
        <PhoneCallsView
          onMakeCall={onMakeCall}
          isLoading={isLoading}
          className={className}
        />
      );
      
    case 'files':
      return (
        <FileManagerView
          onUploadFile={onUploadFile}
          onDownloadFile={onDownloadFile}
          onDeleteFile={onDeleteFile}
          isLoading={isLoading}
          className={className}
        />
      );
      
    default:
      return (
        <GeneralAssistantView
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          className={className}
        />
      );
  }
}