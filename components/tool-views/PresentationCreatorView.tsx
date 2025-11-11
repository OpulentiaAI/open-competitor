'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSliders, FiDownload, FiLoader, FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'bullet';
  bulletPoints?: string[];
}

interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  style: string;
  timestamp: Date;
}

interface PresentationCreatorViewProps {
  onCreatePresentation: (topic: string, slideCount: number, style: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function PresentationCreatorView({ onCreatePresentation, isLoading, className }: PresentationCreatorViewProps) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState('5');
  const [style, setStyle] = useState('professional');
  const [presentations, setPresentations] = useState<Presentation[]>([
    {
      id: '1',
      title: 'Future of AI Technology',
      style: 'professional',
      timestamp: new Date(Date.now() - 3600000),
      slides: [
        {
          id: 's1',
          title: 'Future of AI Technology',
          content: 'Exploring the Next Generation of Artificial Intelligence',
          type: 'title'
        },
        {
          id: 's2', 
          title: 'Current AI Landscape',
          content: 'Overview of today\'s AI technologies and their applications across various industries.',
          type: 'content'
        },
        {
          id: 's3',
          title: 'Emerging Trends',
          content: 'Key trends shaping the future of AI including machine learning advances, neural networks, and automation.',
          type: 'bullet',
          bulletPoints: [
            'Advanced neural architectures',
            'Edge computing integration', 
            'AI democratization',
            'Ethical AI development'
          ]
        }
      ]
    }
  ]);

  const presentationStyles = [
    { value: 'professional', label: 'Professional', description: 'Clean, corporate style' },
    { value: 'creative', label: 'Creative', description: 'Colorful and artistic' },
    { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
    { value: 'academic', label: 'Academic', description: 'Research-focused design' }
  ];

  const exampleTopics = [
    'Introduction to Machine Learning',
    'Marketing Strategy 2024',
    'Project Management Best Practices',
    'Digital Transformation Guide',
    'Sustainable Business Practices'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    const newPresentation: Presentation = {
      id: Date.now().toString(),
      title: topic,
      style: style,
      slides: [], // Will be populated when API responds
      timestamp: new Date()
    };

    setPresentations(prev => [newPresentation, ...prev]);
    onCreatePresentation(topic, parseInt(slideCount), style);
    setTopic('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Tabs defaultValue="create" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FiEye className="w-4 h-4" />
            My Presentations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 flex flex-col mt-0">
          {/* Creation Form */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Presentation Topic
                </label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Digital Marketing Trends 2024"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Slides
                  </label>
                  <Select value={slideCount} onValueChange={setSlideCount} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 10, 12, 15].map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} slides
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presentationStyles.map(styleOption => (
                        <SelectItem key={styleOption.value} value={styleOption.value}>
                          <div>
                            <div className="font-medium">{styleOption.label}</div>
                            <div className="text-xs text-gray-500">{styleOption.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={!topic.trim() || isLoading}
                    className="px-6"
                  >
                    {isLoading ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiSliders className="w-4 h-4" />
                    )}
                    <span className="ml-2">{isLoading ? 'Creating...' : 'Create'}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Example Topics */}
          {presentations.length <= 1 && !isLoading && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Popular topics:</p>
              <div className="flex flex-wrap gap-2">
                {exampleTopics.map((example, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => setTopic(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiLoader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Creating your presentation...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presentations.map((presentation, index) => (
                <motion.div
                  key={presentation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {presentation.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {presentationStyles.find(s => s.value === presentation.style)?.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {presentation.slides.length} slides • Created {presentation.timestamp.toLocaleDateString()}
                    </p>
                    
                    {/* Slide Preview */}
                    {presentation.slides.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Preview:</div>
                        <div className="bg-gray-100 rounded p-2">
                          <div className="text-sm font-medium text-gray-800">
                            {presentation.slides[0].title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {presentation.slides[0].content.substring(0, 80)}...
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <FiEye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <FiEdit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        <FiDownload className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {presentations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiSliders className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No presentations yet</h3>
                <p className="text-gray-600">Create your first presentation using the form above</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}