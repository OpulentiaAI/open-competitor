import React from 'react';
import { FiSearch, FiCopy, FiExternalLink } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { ResearchReportView } from '../views/ResearchReportView';

// Wrapper component to map new props to existing view
const ResearchReportContent = ({ data }: ArtifactContentProps) => {
  return <ResearchReportView data={data} />;
};

export const researchReportArtifact = new Artifact({
  type: 'research_report',
  title: 'Research Report',
  description: 'Comprehensive research report with focus areas and sources.',
  component: ResearchReportContent,
  icon: <FiSearch className="w-5 h-5" />,
  actions: [
    {
      icon: <FiCopy className="w-4 h-4" />,
      description: 'Copy Report Summary',
      onClick: ({ data }) => {
        // Example action: Copy summary to clipboard
        const summary = data.sources?.map((s: any) => s.title).join('\n');
        if (summary) {
          navigator.clipboard.writeText(summary);
          // In a real app, we would show a toast here
          console.log('Copied to clipboard');
        }
      }
    }
  ],
  toolbar: [
    // Example toolbar item
    {
      icon: <FiExternalLink className="w-4 h-4" />,
      description: 'Find more sources',
      onClick: ({ sendMessage }) => {
        // Example: trigger a follow-up search
        // sendMessage({ role: 'user', content: 'Find more sources for this report' });
        console.log('Triggering search for more sources');
      }
    }
  ]
});
