import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronRight, FiActivity } from 'react-icons/fi';

export const ThinkingBlock = ({ content, isThinking = false }: { content: string; isThinking?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(isThinking);
  
  // Auto-expand when new content comes in while thinking
  useEffect(() => {
    if (isThinking) {
      setIsExpanded(true);
    }
  }, [isThinking, content]);

  if (!content) return null;

  return (
    <div className="my-2 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
      >
        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
        <span className="flex items-center gap-2">
          {isThinking ? (
            <>
              <FiActivity className="animate-pulse text-blue-500" />
              Thinking process...
            </>
          ) : (
            'Reasoning process'
          )}
        </span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 text-sm text-gray-600 font-mono whitespace-pre-wrap border-t border-gray-100/50">
              {content}
              {isThinking && (
                <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
