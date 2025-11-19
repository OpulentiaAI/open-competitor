import React, { useState, useEffect, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import { artifactRegistry } from './ArtifactRegistry';
import { ArtifactActionContext, ArtifactToolbarContext, ArtifactMode } from './ArtifactTypes';

interface ArtifactPanelProps {
  artifact: { type: string; data: any; title?: string; _meta?: any };
  onClose?: () => void;
  className?: string;
  isReadonly?: boolean;
}

export const ArtifactPanelNew = ({ 
  artifact: artifactData, 
  onClose, 
  className,
  isReadonly = false
}: ArtifactPanelProps) => {
  const [metadata, setMetadata] = useState<any>({});
  const [mode, setMode] = useState<ArtifactMode>('view');
  
  // Versioning state (placeholder for now)
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const isCurrentVersion = true; // simplified

  const definition = useMemo(() => 
    artifactRegistry.get(artifactData.type), 
  [artifactData.type]);

  useEffect(() => {
    if (definition?.initialize) {
      definition.initialize({
        data: artifactData.data,
        setMetadata
      });
    }
  }, [definition, artifactData.data]);

  if (!definition) {
    return (
      <div className="p-4 text-red-500">
        Unknown artifact type: {artifactData.type}
      </div>
    );
  }

  const Component = definition.component;
  const title = artifactData.title || definition.title;

  // Contexts
  const actionContext: ArtifactActionContext = {
    data: artifactData.data,
    mode,
    currentVersionIndex,
    isCurrentVersion,
    handleVersionChange: (type) => console.log('Version change:', type), // Placeholder
    metadata,
    setMetadata,
    isReadonly
  };

  const toolbarContext: ArtifactToolbarContext = {
    sendMessage: (msg) => console.log('Send message:', msg), // Placeholder
    storeApi: {} // Placeholder
  };

  return (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 overflow-hidden">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-gray-500">
              {definition.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="font-semibold text-gray-900 truncate text-sm">
                {title}
              </h2>
              <span className="text-xs text-gray-500 truncate">
                {definition.description}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          {definition.actions?.map((action, idx) => {
            const disabled = action.isDisabled?.(actionContext);
            return (
              <button
                key={idx}
                onClick={() => !disabled && action.onClick(actionContext)}
                disabled={disabled}
                title={action.description}
                className={`p-2 rounded-md transition-colors ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed text-gray-300' 
                    : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                {action.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Component 
              data={artifactData.data}
              mode={mode}
              isCurrentVersion={isCurrentVersion}
              currentVersionIndex={currentVersionIndex}
              isReadonly={isReadonly}
              metadata={metadata}
              setMetadata={setMetadata}
            />
          </div>
        </div>

        {/* Floating Toolbar */}
        {definition.toolbar && definition.toolbar.length > 0 && !isReadonly && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 ring-1 ring-black/5">
            {definition.toolbar.map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.onClick(toolbarContext)}
                title={item.description}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                {item.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
