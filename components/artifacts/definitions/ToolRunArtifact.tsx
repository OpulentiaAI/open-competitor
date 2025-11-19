import React from 'react';
import { FiBox, FiRefreshCw } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { ToolRunView } from '../views/ToolRunView';

const ToolRunContent = ({ data }: ArtifactContentProps) => {
  return <ToolRunView data={data} />;
};

export const toolRunArtifact = new Artifact({
  type: 'tool_run',
  title: 'Tool Execution',
  description: 'Output from tool execution.',
  component: ToolRunContent,
  icon: <FiBox className="w-5 h-5" />,
  actions: [
    {
      icon: <FiRefreshCw className="w-4 h-4" />,
      description: 'Rerun Tool',
      onClick: () => {
        console.log('Rerun tool logic');
      }
    }
  ]
});
