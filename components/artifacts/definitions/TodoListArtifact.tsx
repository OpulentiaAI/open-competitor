import React from 'react';
import { FiCheckSquare, FiPlus } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { TodoListView } from '../views/TodoListView';

const TodoListContent = ({ data }: ArtifactContentProps) => {
  return <TodoListView data={data} />;
};

export const todoListArtifact = new Artifact({
  type: 'todo_list',
  title: 'Todo List',
  description: 'Task list and action items.',
  component: TodoListContent,
  icon: <FiCheckSquare className="w-5 h-5" />,
  actions: [
    {
      icon: <FiPlus className="w-4 h-4" />,
      description: 'Add Item',
      onClick: () => {
        console.log('Add item logic');
      }
    }
  ]
});
