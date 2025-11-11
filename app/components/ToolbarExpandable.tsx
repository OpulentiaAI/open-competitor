'use client';

import React, { useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { cn } from '@/lib/utils';
import useClickOutside from '@/hooks/useClickOutside';
import { Folder, MessageCircle, BookOpen, Calendar, Settings, History } from 'lucide-react';

const transition = {
  type: 'spring' as const,
  bounce: 0.1,
  duration: 0.25,
};

interface ToolbarItem {
  id: number;
  label: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface ToolbarExpandableProps {
  items?: ToolbarItem[];
  onActionClick?: (action: string, itemId: number) => void;
}

// Default items with chat-relevant context
const DEFAULT_ITEMS: ToolbarItem[] = [
  {
    id: 1,
    label: 'Recent Chats',
    title: <History className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-col space-y-2 text-zinc-700'>
          <div className='text-sm font-medium'>Recent Conversations</div>
          <div className='space-y-1 text-sm'>
            <div className='cursor-pointer hover:text-blue-600'>MealOutpost Integration</div>
            <div className='cursor-pointer hover:text-blue-600'>Presentation Templates</div>
            <div className='cursor-pointer hover:text-blue-600'>Google Sheets Analysis</div>
          </div>
        </div>
        <button
          className='relative h-8 w-full scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]'
          type='button'
        >
          View All History
        </button>
      </div>
    ),
  },
  {
    id: 2,
    label: 'Quick Actions',
    title: <MessageCircle className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='text-zinc-700 text-sm'>
          <div className='font-medium mb-2'>Quick Prompts</div>
          <div className='space-y-2'>
            <div className='cursor-pointer text-blue-600 hover:text-blue-700'>📊 Analyze data</div>
            <div className='cursor-pointer text-blue-600 hover:text-blue-700'>🎨 Create presentation</div>
            <div className='cursor-pointer text-blue-600 hover:text-blue-700'>🔍 Search meals</div>
          </div>
        </div>
        <button
          className='relative h-8 w-full scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]'
          type='button'
        >
          Customize Actions
        </button>
      </div>
    ),
  },
  {
    id: 3,
    label: 'Documents',
    title: <Folder className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-col text-zinc-700'>
          <div className='text-sm font-medium mb-2'>Recent Documents</div>
          <div className='space-y-1 text-sm'>
            <div className='cursor-pointer hover:text-blue-600'>📄 Q4_Report.pdf</div>
            <div className='cursor-pointer hover:text-blue-600'>📊 Sales_Data.xlsx</div>
            <div className='cursor-pointer hover:text-blue-600'>📝 Meeting_Notes.docx</div>
          </div>
        </div>
        <button
          className='relative h-8 w-full scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]'
          type='button'
        >
          Manage Documents
        </button>
      </div>
    ),
  },
  {
    id: 4,
    label: 'Templates',
    title: <BookOpen className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-col text-zinc-700'>
          <div className='text-sm font-medium mb-2'>Saved Templates</div>
          <div className='space-y-1 text-sm'>
            <div className='cursor-pointer hover:text-blue-600'>Business Proposal</div>
            <div className='cursor-pointer hover:text-blue-600'>Marketing Plan</div>
            <div className='cursor-pointer hover:text-blue-600'>Project Timeline</div>
          </div>
        </div>
        <button
          className='relative h-8 w-full scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]'
          type='button'
        >
          Browse Templates
        </button>
      </div>
    ),
  },
  {
    id: 5,
    label: 'Schedule',
    title: <Calendar className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-col text-zinc-700'>
          <div className='text-sm font-medium mb-2'>Today&apos;s Schedule</div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Team Meeting</span>
              <span className='text-zinc-500'>10:00 AM</span>
            </div>
            <div className='flex justify-between'>
              <span>Client Call</span>
              <span className='text-zinc-500'>2:00 PM</span>
            </div>
            <div className='flex justify-between'>
              <span>Project Review</span>
              <span className='text-zinc-500'>4:30 PM</span>
            </div>
          </div>
        </div>
        <button
          className='relative h-8 w-full scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]'
          type='button'
        >
          View Calendar
        </button>
      </div>
    ),
  },
  {
    id: 6,
    label: 'Settings',
    title: <Settings className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-col text-zinc-700'>
          <div className='text-sm font-medium mb-2'>Preferences</div>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span>Dark Mode</span>
              <input type='checkbox' className='rounded' />
            </div>
            <div className='flex items-center justify-between'>
              <span>Notifications</span>
              <input type='checkbox' defaultChecked className='rounded' />
            </div>
            <div className='flex items-center justify-between'>
              <span>Auto-save</span>
              <input type='checkbox' defaultChecked className='rounded' />
            </div>
          </div>
        </div>
        <button
          className='relative h-8 w-full scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]'
          type='button'
        >
          Advanced Settings
        </button>
      </div>
    ),
  },
];

export default function ToolbarExpandable({ items = DEFAULT_ITEMS, onActionClick }: ToolbarExpandableProps) {
  const [active, setActive] = useState<number | null>(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const [menuRef, { width: widthContainer }] = useMeasure();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);

  useClickOutside(ref, () => {
    setIsOpen(false);
    setActive(null);
  });

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return;
    setMaxWidth(widthContainer);
  }, [widthContainer, maxWidth]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedActive = localStorage.getItem('toolbar_active');
    const savedIsOpen = localStorage.getItem('toolbar_isOpen');
    
    if (savedActive) {
      setActive(Number(savedActive));
    }
    if (savedIsOpen === 'true') {
      setIsOpen(true);
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (active !== null) {
      localStorage.setItem('toolbar_active', String(active));
    } else {
      localStorage.removeItem('toolbar_active');
    }
  }, [active]);

  useEffect(() => {
    localStorage.setItem('toolbar_isOpen', String(isOpen));
  }, [isOpen]);

  return (
    <MotionConfig transition={transition}>
      <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50' ref={ref}>
        <div className='h-full w-full rounded-xl border border-zinc-950/10 bg-white shadow-lg'>
          <div className='overflow-hidden'>
            <AnimatePresence initial={false} mode='sync'>
              {isOpen ? (
                <motion.div
                  key='content'
                  initial={{ height: 0 }}
                  animate={{ height: heightContent || 0 }}
                  exit={{ height: 0 }}
                  style={{
                    width: maxWidth,
                  }}
                >
                  <div ref={contentRef} className='p-2'>
                    {items.map((item) => {
                      const isSelected = active === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isSelected ? 1 : 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <div
                            className={cn(
                              'px-2 pt-2 text-sm',
                              isSelected ? 'block' : 'hidden'
                            )}
                          >
                            {item.content}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className='flex space-x-2 p-2' ref={menuRef}>
            {items.map((item) => (
              <button
                key={item.id}
                aria-label={item.label}
                className={cn(
                  'relative flex h-9 w-9 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98]',
                  active === item.id ? 'bg-zinc-100 text-zinc-800' : ''
                )}
                type='button'
                onClick={() => {
                  if (!isOpen) setIsOpen(true);
                  if (active === item.id) {
                    setIsOpen(false);
                    setActive(null);
                    return;
                  }

                  setActive(item.id);
                  if (onActionClick) {
                    onActionClick(item.label, item.id);
                  }
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
