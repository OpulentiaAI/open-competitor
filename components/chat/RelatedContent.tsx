import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiFileText, FiGrid, FiLink } from 'react-icons/fi';

interface RelatedItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  preview?: string;
}

interface RelatedContentProps {
  items: RelatedItem[];
  onItemClick: (item: RelatedItem) => void;
}

export const RelatedContent = ({ items, onItemClick }: RelatedContentProps) => {
  if (!items || items.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FiFileText className="text-blue-500" />;
      case 'spreadsheet': return <FiGrid className="text-green-500" />;
      default: return <FiLink className="text-gray-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 pt-4 border-t border-gray-100"
    >
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Related Content</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all group text-left"
          >
            <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100 group-hover:border-blue-100">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-500 truncate">{item.type}</p>
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

