import React from 'react';
import ReactMarkdown from 'react-markdown';

export const TodoListView = ({ data }: { data: any }) => {
  const content = data.todos || data.content;
  if (!content) return null;
  
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

