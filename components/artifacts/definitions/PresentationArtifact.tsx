import React from 'react';
import { FiSliders, FiPlay, FiMaximize } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { PresentationView } from '../views/PresentationView';

const PresentationContent = ({ data }: ArtifactContentProps) => {
  return <PresentationView data={data} />;
};

export const presentationArtifact = new Artifact({
  type: 'presentation',
  title: 'Presentation Deck',
  description: 'Generated presentation slides.',
  component: PresentationContent,
  icon: <FiSliders className="w-5 h-5" />,
  actions: [
    {
      icon: <FiPlay className="w-4 h-4" />,
      description: 'Present Slides',
      onClick: () => {
        console.log('Starting presentation mode');
      }
    },
    {
      icon: <FiMaximize className="w-4 h-4" />,
      description: 'Fullscreen',
      onClick: () => {
        // Trigger fullscreen logic
      }
    }
  ]
});
