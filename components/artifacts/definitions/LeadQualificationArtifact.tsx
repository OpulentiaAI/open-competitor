import React from 'react';
import { FiActivity, FiCheck } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { LeadQualificationView } from '../views/LeadQualificationView';

const LeadQualificationContent = ({ data }: ArtifactContentProps) => {
  return <LeadQualificationView data={data} />;
};

export const leadQualificationArtifact = new Artifact({
  type: 'lead_qualification',
  title: 'Lead Qualification',
  description: 'Lead scoring and qualification details.',
  component: LeadQualificationContent,
  icon: <FiActivity className="w-5 h-5" />,
  actions: [
    {
      icon: <FiCheck className="w-4 h-4" />,
      description: 'Approve Lead',
      onClick: () => {
        console.log('Lead approved');
      }
    }
  ]
});
