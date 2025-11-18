import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { ArtifactRenderer, getArtifactIcon, getArtifactTitle } from './ArtifactRenderer';
import { artifactProcessor } from './ArtifactProcessor';
import { artifactDebut } from './ArtifactDebut';

interface ArtifactPanelProps {
  artifacts: any[];
  className?: string;
  title?: string;
  onClose?: () => void;
}

export const ArtifactPanel = ({ artifacts, className, title, onClose }: ArtifactPanelProps) => {
  const [processedArtifacts, setProcessedArtifacts] = useState<any[]>([]);
  const [expandedArtifactId, setExpandedArtifactId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtifacts = async () => {
      setLoading(true);
      const processed = await Promise.all(
        artifacts.map(async (a) => {
          const data = await artifactProcessor.processArtifactData(a);
          return { ...data, _original: a };
        })
      );
      setProcessedArtifacts(processed);
      setLoading(false);
    };

    loadArtifacts();
  }, [artifacts]);

  const handleDebut = async (id: string, type: string) => {
    if (!artifactDebut.isDebuted(id)) {
      artifactDebut.markAsDebuted(id);
      // logic handled by framer motion initial/animate usually, 
      // but we could trigger imperative animation here if needed.
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 shadow-xl ${className}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">{title || 'Artifacts'}</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        <AnimatePresence>
          {processedArtifacts.map((artifact, idx) => {
            const id = artifact._original?._id || `artifact-${idx}`;
            const isExpanded = expandedArtifactId === id;

            return (
              <ArtifactCard
                key={id}
                artifact={artifact}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedArtifactId(isExpanded ? null : id)}
                onDebut={() => handleDebut(id, artifact.type)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ArtifactCard = ({ 
  artifact, 
  isExpanded, 
  onToggleExpand,
  onDebut 
}: { 
  artifact: any; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
  onDebut: () => void;
}) => {
  const controls = useAnimation();
  
  useEffect(() => {
    onDebut();
    const config = artifactDebut.getDebutConfig(artifact.type);
    artifactDebut.showDebutAnimation(controls, config);
  }, []);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white">
          {getArtifactIcon(artifact.type)}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {getArtifactTitle(artifact.type)}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(artifact._meta?.createdAt || Date.now()).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        </div>
        
        <div className="p-4">
           <ArtifactRenderer 
             data={artifact} 
             context={{ isExpanded }}
           />
        </div>
      </motion.div>

      {/* Full Screen / Expanded Modal Overlay if needed for "Super Expanded" view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onToggleExpand}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
               <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  {getArtifactIcon(artifact.type)}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{getArtifactTitle(artifact.type)}</h2>
                    <p className="text-sm text-gray-500">Detailed View</p>
                  </div>
                </div>
                <button onClick={onToggleExpand} className="p-2 hover:bg-gray-200 rounded-full">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <ArtifactRenderer 
                  data={artifact} 
                  context={{ isExpanded: true }} 
                />
                
                {/* Raw Data View for debugging or details */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 font-medium">View Raw Data</summary>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                      {JSON.stringify(artifact, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

