import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';

export const PresentationView = ({ data }: { data: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (!data || !data.slides || data.slides.length === 0) return null;
  const slides = data.slides;

  const nextSlide = () => setCurrentSlide(curr => (curr + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(curr => (curr - 1 + slides.length) % slides.length);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Slide Viewport */}
      <div className="relative flex-1 bg-white flex items-center justify-center p-8 overflow-hidden aspect-video">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col bg-white"
          >
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {currentSlideData.title || `Slide ${currentSlide + 1}`}
              </h2>
              
              <div className="prose prose-sm max-w-none text-gray-700 mx-auto">
                {currentSlideData.bulletPoints ? (
                   <ul className="list-disc pl-5 space-y-2">
                     {currentSlideData.bulletPoints.map((point: string, idx: number) => (
                       <li key={idx} className="text-lg">{point}</li>
                     ))}
                   </ul>
                ) : (
                  <p className="whitespace-pre-wrap text-lg text-center leading-relaxed">
                    {currentSlideData.content || currentSlideData.text}
                  </p>
                )}
              </div>
            </div>
            
            {currentSlideData.footer && (
              <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                {currentSlideData.footer}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2">
          <button 
            onClick={prevSlide}
            className="pointer-events-auto p-2 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 transition-colors"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="pointer-events-auto p-2 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 transition-colors"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer / Pagination */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="text-xs text-gray-500 font-medium">
          Slide {currentSlide + 1} of {slides.length}
        </div>
        <div className="flex gap-1">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentSlide ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMaximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

