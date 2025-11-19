import React from 'react';
import { FiFileText, FiCopy, FiPrinter } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { ProgramPlanView } from '../views/ProgramPlanView';

const ProgramPlanContent = ({ data }: ArtifactContentProps) => {
  return <ProgramPlanView data={data} />;
};

export const programPlanArtifact = new Artifact({
  type: 'program_plan',
  title: 'Program Plan',
  description: 'Detailed daily program schedule.',
  component: ProgramPlanContent,
  icon: <FiFileText className="w-5 h-5" />,
  actions: [
    {
      icon: <FiCopy className="w-4 h-4" />,
      description: 'Copy Plan',
      onClick: ({ data }) => {
        const text = data.days?.map((d: any) => `Day ${d.day}: ${d.meals?.join(', ')}`).join('\n');
        if (text) {
          navigator.clipboard.writeText(text);
          console.log('Copied plan');
        }
      }
    },
    {
      icon: <FiPrinter className="w-4 h-4" />,
      description: 'Print Plan',
      onClick: () => {
        window.print();
      }
    }
  ]
});
