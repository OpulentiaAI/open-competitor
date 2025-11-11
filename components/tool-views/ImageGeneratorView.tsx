'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiDownload, FiLoader, FiRefreshCw, FiZap } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

interface ImageGeneratorViewProps {
  onGenerateImage: (prompt: string, style: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function ImageGeneratorView({ onGenerateImage, isLoading, className }: ImageGeneratorViewProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=512&h=512&fit=crop',
      prompt: 'A serene mountain landscape at sunset',
      style: 'realistic',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=512&h=512&fit=crop',
      prompt: 'Futuristic city with flying cars',
      style: 'sci-fi',
      timestamp: new Date(Date.now() - 7200000)
    }
  ]);

  const artStyles = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { value: 'artistic', label: 'Artistic', description: 'Painterly and creative' },
    { value: 'cartoon', label: 'Cartoon', description: 'Animated style' },
    { value: 'abstract', label: 'Abstract', description: 'Abstract art' },
    { value: 'minimalist', label: 'Minimalist', description: 'Clean and simple' },
    { value: 'vintage', label: 'Vintage', description: 'Retro aesthetic' },
    { value: 'sci-fi', label: 'Sci-Fi', description: 'Science fiction' },
    { value: 'fantasy', label: 'Fantasy', description: 'Magical and mythical' }
  ];

  const examplePrompts = [
    'A majestic dragon flying over a medieval castle',
    'A cozy coffee shop on a rainy day',
    'A futuristic spacecraft landing on Mars',
    'A beautiful garden with colorful flowers',
    'A steampunk mechanical city'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const imageData: GeneratedImage = {
      id: Date.now().toString(),
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=512&h=512&fit=crop', // Placeholder
      prompt: prompt,
      style: style,
      timestamp: new Date()
    };

    setGeneratedImages(prev => [imageData, ...prev]);
    onGenerateImage(prompt, style);
    setPrompt('');
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Generation Form */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your image
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A beautiful sunset over mountains with a lake in the foreground..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Art Style
              </label>
              <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {artStyles.map((styleOption) => (
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
                disabled={!prompt.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiZap className="w-4 h-4" />
                )}
                <span className="ml-2">{isLoading ? 'Generating...' : 'Generate'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Example Prompts */}
      {generatedImages.length <= 2 && !isLoading && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Try these prompts:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Generated Images */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                  
                  {/* Download Button Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => handleDownload(image.url, `generated-image-${image.id}`)}
                    >
                      <FiDownload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3">
                  <p className="text-sm text-gray-800 mb-2 line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {artStyles.find(s => s.value === image.style)?.label || image.style}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {image.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <FiLoader className="w-16 h-16 animate-spin text-blue-500" />
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-600">Creating your masterpiece...</p>
              <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && generatedImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiImage className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images generated yet</h3>
            <p className="text-gray-600 mb-4">Enter a description above to start creating AI-generated images</p>
          </div>
        )}
      </div>
    </div>
  );
}