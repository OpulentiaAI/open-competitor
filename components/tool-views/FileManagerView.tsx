'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPaperclip, FiUpload, FiDownload, FiFile, FiFolder, FiImage, FiFileText, FiVideo, FiMusic, FiTrash2, FiEye, FiEdit } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  mimeType?: string;
  thumbnail?: string;
  lastModified: Date;
  path: string;
}

interface FileManagerViewProps {
  onUploadFile: (file: File) => void;
  onDownloadFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function FileManagerView({ onUploadFile, onDownloadFile, onDeleteFile, isLoading, className }: FileManagerViewProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Project Documents',
      type: 'folder',
      lastModified: new Date(Date.now() - 3600000),
      path: '/project-documents'
    },
    {
      id: '2',
      name: 'presentation-slides.pptx',
      type: 'file',
      size: '2.3 MB',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      lastModified: new Date(Date.now() - 7200000),
      path: '/presentation-slides.pptx'
    },
    {
      id: '3',
      name: 'logo-design.png',
      type: 'file',
      size: '156 KB',
      mimeType: 'image/png',
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=150&fit=crop',
      lastModified: new Date(Date.now() - 86400000),
      path: '/logo-design.png'
    },
    {
      id: '4',
      name: 'meeting-notes.docx',
      type: 'file',
      size: '45 KB',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      lastModified: new Date(Date.now() - 172800000),
      path: '/meeting-notes.docx'
    },
    {
      id: '5',
      name: 'product-demo.mp4',
      type: 'file',
      size: '12.7 MB',
      mimeType: 'video/mp4',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=150&fit=crop',
      lastModified: new Date(Date.now() - 259200000),
      path: '/product-demo.mp4'
    }
  ]);

  const getFileIcon = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return <FiFolder className="w-8 h-8 text-blue-500" />;
    
    if (mimeType.startsWith('image/')) return <FiImage className="w-8 h-8 text-green-500" />;
    if (mimeType.startsWith('video/')) return <FiVideo className="w-8 h-8 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <FiMusic className="w-8 h-8 text-orange-500" />;
    if (mimeType.includes('document') || mimeType.includes('text')) return <FiFileText className="w-8 h-8 text-red-500" />;
    
    return <FiFile className="w-8 h-8 text-gray-500" />;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'border-green-200 bg-green-50';
    if (mimeType.startsWith('video/')) return 'border-purple-200 bg-purple-50';
    if (mimeType.startsWith('audio/')) return 'border-orange-200 bg-orange-50';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-gray-50';
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const handleDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
    } else {
      onDownloadFile(file.id);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Tabs defaultValue="browse" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FiFolder className="w-4 h-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FiUpload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="flex-1 flex flex-col mt-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Current path:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{currentPath}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <FiFolder className="w-4 h-4 mr-1" />
                  New Folder
                </Button>
                <Button size="sm" variant="outline">
                  <FiUpload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <FiPaperclip className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="pl-10"
              />
            </div>
          </div>

          {/* File Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`p-3 hover:shadow-lg transition-all cursor-pointer border-2 ${getFileTypeColor(file.mimeType || '')}`}
                    onDoubleClick={() => handleDoubleClick(file)}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Thumbnail or Icon */}
                      <div className="mb-2">
                        {file.thumbnail ? (
                          <img 
                            src={file.thumbnail} 
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          getFileIcon(file.mimeType || '', file.type === 'folder')
                        )}
                      </div>
                      
                      {/* File Name */}
                      <h4 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {file.name}
                      </h4>
                      
                      {/* File Info */}
                      <div className="text-xs text-gray-500 space-y-1">
                        {file.size && (
                          <div>{file.size}</div>
                        )}
                        <div>{file.lastModified.toLocaleDateString()}</div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.type === 'file' && (
                          <>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <FiEye className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownloadFile(file.id);
                              }}
                            >
                              <FiDownload className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(file.id);
                              }}
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiPaperclip className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No files found' : 'No files in this folder'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
                </p>
                {!searchTerm && (
                  <Button>
                    <FiUpload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="w-full max-w-md p-8 text-center">
              <div className="mb-6">
                <FiUpload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>
                <p className="text-gray-600">Drag and drop files here or click to browse</p>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <FiUpload className="w-4 h-4 mr-2 animate-bounce" />
                  ) : (
                    <FiUpload className="w-4 h-4 mr-2" />
                  )}
                  Choose Files
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4, MP3
                <br />
                Maximum file size: 50MB
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Accessed</h3>
            
            <div className="space-y-3">
              {files
                .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
                .slice(0, 10)
                .map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.mimeType || '', file.type === 'folder')}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {file.size && <span>{file.size}</span>}
                            <span>{file.lastModified.toLocaleDateString()}</span>
                            <span>{file.lastModified.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {file.type === 'file' && (
                            <>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <FiEye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => onDownloadFile(file.id)}
                              >
                                <FiDownload className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}