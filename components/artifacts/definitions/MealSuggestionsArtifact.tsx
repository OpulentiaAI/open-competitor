import React from 'react';
import { FiGrid, FiMapPin } from 'react-icons/fi';
import { Artifact, ArtifactContentProps } from '../ArtifactTypes';
import { MealSuggestionsView } from '../views/MealSuggestionsView';

const MealSuggestionsContent = ({ data }: ArtifactContentProps) => {
  return <MealSuggestionsView data={data} />;
};

export const mealSuggestionsArtifact = new Artifact({
  type: 'meal_suggestions',
  title: 'Meal Suggestions',
  description: 'Recommended meals and restaurants.',
  component: MealSuggestionsContent,
  icon: <FiGrid className="w-5 h-5" />,
  actions: [
    {
      icon: <FiMapPin className="w-4 h-4" />,
      description: 'View on Map',
      onClick: () => {
        console.log('Open map view');
      }
    }
  ]
});
