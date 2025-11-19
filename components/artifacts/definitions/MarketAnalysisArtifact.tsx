import React from 'react';
import { FiTrendingUp, FiCopy } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { MarketAnalysisView } from '../views/MarketAnalysisView';

const MarketAnalysisContent = ({ data }: ArtifactContentProps) => {
  return <MarketAnalysisView data={data} />;
};

export const marketAnalysisArtifact = new Artifact({
  type: 'market_analysis',
  title: 'Market Analysis',
  description: 'Analysis of market trends and opportunities.',
  component: MarketAnalysisContent,
  icon: <FiTrendingUp className="w-5 h-5" />,
  actions: [
    {
      icon: <FiCopy className="w-4 h-4" />,
      description: 'Copy Analysis',
      onClick: ({ data }) => {
        const text = [
          `Summary: ${data.summary}`,
          `Trends: ${data.trends?.join(', ')}`,
          `Opportunities: ${data.opportunities?.join(', ')}`
        ].join('\n\n');
        if (text) {
          navigator.clipboard.writeText(text);
        }
      }
    }
  ]
});
