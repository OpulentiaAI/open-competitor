import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMaximize2 } from 'react-icons/fi';
import { ArtifactRenderer, getArtifactIcon, getArtifactTitle } from './ArtifactRenderer';
import { artifactProcessor } from './ArtifactProcessor';
import { ArtifactPanelNew } from './ArtifactPanelNew';
import { artifactRegistry } from './ArtifactRegistry';

export const InlineArtifactCard = ({ artifact }: { artifact: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Ensure we have the right data structure
  useEffect(() => {
    const process = async () => {
      const data = await artifactProcessor.processArtifactData(artifact);
      const type = artifact.type;
      const timestamp = artifact.createdAt || artifact._creationTime;
      // Wrap it for the renderer
      setProcessedData({ ...data, type, _meta: { createdAt: timestamp } });
    }
    process();
  }, [artifact]);

  if (!processedData) return null;

  // Check if this artifact type is registered in the new registry
  const isNewArtifact = !!artifactRegistry.get(processedData.type);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          {getArtifactIcon(processedData.type)}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-sm">
              {getArtifactTitle(processedData.type)}
            </h4>
            <p className="text-xs text-gray-500">
              {new Date(processedData._meta?.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleExpand}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <FiMaximize2 className="w-3 h-3" />
            View
          </button>
        </div>
        <div className="mt-2">
          {/* Render the artifact content directly inline */}
          <div className="max-h-64 overflow-hidden relative">
             <div className="scale-90 origin-top-left w-[111%]">
               <ArtifactRenderer data={processedData} />
             </div>
             {/* Fade out effect for long content */}
             <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleExpand}
          >
            <motion.div
              className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] h-[80vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isNewArtifact ? (
                <ArtifactPanelNew
                  artifact={processedData}
                  onClose={toggleExpand}
                  className="h-full w-full border-0 shadow-none rounded-none"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                       {getArtifactIcon(processedData.type)}
                       <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {getArtifactTitle(processedData.type)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Generated {new Date(processedData._meta?.createdAt).toLocaleString()}
                          </p>
                       </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1">
                    <ArtifactRenderer 
                        data={processedData} 
                        context={{ isExpanded: true }} 
                    />
                    
                     <div className="mt-6 pt-6 border-t border-gray-100">
                        <details className="text-xs text-gray-400">
                            <summary className="cursor-pointer hover:text-gray-600">Debug Data</summary>
                             <pre className="mt-2 p-3 bg-gray-50 rounded border border-gray-100 overflow-x-auto">
                                {JSON.stringify(artifact, null, 2)}
                             </pre>
                        </details>
                     </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


