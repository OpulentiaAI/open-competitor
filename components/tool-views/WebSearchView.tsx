'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiExternalLink, FiLoader, FiGlobe } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  timestamp?: string;
}

interface WebSearchViewProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function WebSearchView({ onSearch, isLoading, className }: WebSearchViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const trimmedQuery = query.trim();
    if (!searchHistory.includes(trimmedQuery)) {
      setSearchHistory(prev => [trimmedQuery, ...prev.slice(0, 4)]); // Keep last 5 searches
    }
    
    onSearch(trimmedQuery);
    setQuery('');
  };

  const popularSearches = [
    'Latest technology trends 2024',
    'Best coding practices',
    'AI and machine learning',
    'Web development frameworks',
    'JavaScript tips and tricks'
  ];

  const mockResults: SearchResult[] = [
    {
      title: 'OpenAI GPT-4: The Next Generation of Language Models',
      url: 'https://openai.com/gpt-4',
      description: 'Discover the capabilities and improvements of GPT-4, the latest language model from OpenAI with enhanced reasoning and multimodal abilities.',
      timestamp: '2 hours ago'
    },
    {
      title: 'Building Modern Web Applications with Next.js',
      url: 'https://nextjs.org/learn',
      description: 'A comprehensive guide to building production-ready applications using Next.js 14+ with the App Router.',
      timestamp: '1 day ago'
    },
    {
      title: 'The Future of AI: Trends and Predictions',
      url: 'https://example.com/ai-future',
      description: 'An in-depth analysis of artificial intelligence trends, emerging technologies, and their potential impact on various industries.',
      timestamp: '3 days ago'
    }
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web..."
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiSearch className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Search History & Popular Searches */}
      {results.length === 0 && !isLoading && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {searchHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setQuery(search);
                      onSearch(search);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Searches</h3>
            <div className="grid grid-cols-1 gap-2">
              {popularSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => {
                    setQuery(search);
                    onSearch(search);
                  }}
                >
                  <FiGlobe className="w-4 h-4 mr-2 text-gray-400" />
                  {search}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Example Results</h3>
            <div className="space-y-3">
              {mockResults.map((result, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-1">
                        {result.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">{result.url}</p>
                      <p className="text-sm text-gray-700">{result.description}</p>
                      {result.timestamp && (
                        <p className="text-xs text-gray-500 mt-2">{result.timestamp}</p>
                      )}
                    </div>
                    <FiExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Found {results.length} results for: <span className="font-medium">"{searchHistory[0]}"</span>
            </p>
          </div>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-1">
                        {result.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">{result.url}</p>
                      <p className="text-sm text-gray-700">{result.description}</p>
                      {result.timestamp && (
                        <p className="text-xs text-gray-500 mt-2">{result.timestamp}</p>
                      )}
                    </div>
                    <FiExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FiLoader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Searching the web...</p>
          </div>
        </div>
      )}
    </div>
  );
}