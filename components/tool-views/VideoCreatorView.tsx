'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiVideo, FiPlay, FiDownload, FiLoader, FiUpload, FiFile } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VideoProject {
  id: string;
  title: string;
  description: string;
  duration: string;
  style: string;
  status: 'generating' | 'completed' | 'failed';
  thumbnail?: string;
  timestamp: Date;
}

interface VideoCreatorViewProps {
  onCreateVideo: (title: string, description: string, style: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function VideoCreatorView({ onCreateVideo, isLoading, className }: VideoCreatorViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [projects, setProjects] = useState<VideoProject[]>([
    {
      id: '1',
      title: 'Product Demo Video',
      description: 'Showcasing our latest features and capabilities',
      duration: '2:30',
      style: 'modern',
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      title: 'Tutorial: Getting Started',
      description: 'Step-by-step guide for new users',
      duration: '5:15',
      style: 'tutorial',
      status: 'generating',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);

  const videoStyles = [
    { value: 'modern', label: 'Modern', description: 'Clean, contemporary style' },
    { value: 'tutorial', label: 'Tutorial', description: 'Educational and clear' },
    { value: 'promotional', label: 'Promotional', description: 'Marketing-focused' },
    { value: 'documentary', label: 'Documentary', description: 'Professional and informative' },
    { value: 'social', label: 'Social Media', description: 'Short and engaging' },
    { value: 'corporate', label: 'Corporate', description: 'Business-oriented' }
  ];

  const exampleIdeas = [
    'Company introduction video',
    'Product showcase demo',
    'How-to tutorial',
    'Customer testimonial',
    'Event highlights'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isLoading) return;

    const newProject: VideoProject = {
      id: Date.now().toString(),
      title: title,
      description: description,
      duration: '--:--',
      style: style,
      status: 'generating',
      timestamp: new Date()
    };

    setProjects(prev => [newProject, ...prev]);
    onCreateVideo(title, description, style);
    setTitle('');
    setDescription('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Tabs defaultValue="create" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <FiVideo className="w-4 h-4" />
            Create Video
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FiFile className="w-4 h-4" />
            My Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 flex flex-col mt-0">
          {/* Creation Form */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Product Demo - Amazing Features"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to show in this video..."
                  className="min-h-[100px] resize-none"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Style
                  </label>
                  <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoStyles.map(styleOption => (
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
                    disabled={!title.trim() || !description.trim() || isLoading}
                    className="px-6"
                  >
                    {isLoading ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiVideo className="w-4 h-4" />
                    )}
                    <span className="ml-2">{isLoading ? 'Creating...' : 'Create Video'}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Example Ideas */}
          {projects.length <= 2 && !isLoading && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Popular video ideas:</p>
              <div className="flex flex-wrap gap-2">
                {exampleIdeas.map((idea, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => {
                      setTitle(idea);
                      setDescription(`Create a ${idea.toLowerCase()} video with engaging visuals and clear messaging.`);
                    }}
                  >
                    {idea}
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
                <p className="text-sm text-gray-600">Creating your video...</p>
                <p className="text-xs text-gray-500 mt-1">This may take several minutes</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                    {/* Thumbnail */}
                    <div className="relative bg-gray-200 aspect-video">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiVideo className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      {project.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                          <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiPlay className="w-6 h-6" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {project.duration}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                        <Badge className={getStatusColor(project.status)} variant="secondary">
                          {project.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{videoStyles.find(s => s.value === project.style)?.label}</span>
                        <span>{project.timestamp.toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {project.status === 'completed' && (
                          <>
                            <Button size="sm" variant="outline" className="flex-1">
                              <FiPlay className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <FiDownload className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                        {project.status === 'generating' && (
                          <div className="flex-1 flex items-center justify-center py-2">
                            <FiLoader className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Processing...</span>
                          </div>
                        )}
                        {project.status === 'failed' && (
                          <Button size="sm" className="flex-1">
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiVideo className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos created yet</h3>
                <p className="text-gray-600">Create your first video using the form above</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}