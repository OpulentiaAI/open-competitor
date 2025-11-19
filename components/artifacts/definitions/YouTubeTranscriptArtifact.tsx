import React from 'react';
import { FiYoutube, FiExternalLink } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { YouTubeTranscriptView } from '../views/YouTubeTranscriptView';

const YouTubeTranscriptContent = ({ data }: ArtifactContentProps) => {
  return <YouTubeTranscriptView data={data} />;
};

export const youtubeTranscriptArtifact = new Artifact({
  type: 'youtube_transcript',
  title: 'YouTube Transcript',
  description: 'Transcript and segments from YouTube video.',
  component: YouTubeTranscriptContent,
  icon: <FiYoutube className="w-5 h-5" />,
  actions: [
    {
      icon: <FiExternalLink className="w-4 h-4" />,
      description: 'Open Video',
      onClick: ({ data }) => {
        if (data.url) {
          window.open(data.url, '_blank');
        } else if (data.videoId) {
          window.open(`https://youtube.com/watch?v=${data.videoId}`, '_blank');
        }
      }
    }
  ]
});
