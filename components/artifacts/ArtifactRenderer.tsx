import React from 'react';
import { 
  FiFileText, FiSearch, FiSliders, FiYoutube, FiCheckSquare, FiBox, 
  FiActivity, FiGrid, FiTrendingUp 
} from 'react-icons/fi';
import { ProgramPlanView } from './views/ProgramPlanView';
import { ResearchReportView } from './views/ResearchReportView';
import { MarketAnalysisView } from './views/MarketAnalysisView';
import { PresentationView } from './views/PresentationView';
import { YouTubeTranscriptView } from './views/YouTubeTranscriptView';
import { LeadQualificationView } from './views/LeadQualificationView';
import { ToolRunView } from './views/ToolRunView';
import { TodoListView } from './views/TodoListView';
import { MealSuggestionsView } from './views/MealSuggestionsView';
import { DefaultArtifactView } from './views/DefaultArtifactView';

export interface RenderContext {
  isExpanded?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
}

export const getArtifactIcon = (type: string) => {
  switch (type) {
    case 'program_plan':
      return <FiFileText className="w-5 h-5 text-blue-500" />;
    case 'research_report':
      return <FiSearch className="w-5 h-5 text-purple-500" />;
    case 'market_analysis':
      return <FiTrendingUp className="w-5 h-5 text-green-500" />;
    case 'presentation':
      return <FiSliders className="w-5 h-5 text-orange-500" />;
    case 'youtube_transcript':
      return <FiYoutube className="w-5 h-5 text-red-500" />;
    case 'todo_list':
      return <FiCheckSquare className="w-5 h-5 text-emerald-500" />;
    case 'lead_qualification':
      return <FiActivity className="w-5 h-5 text-indigo-500" />;
    case 'meal_suggestions':
      return <FiGrid className="w-5 h-5 text-pink-500" />;
    case 'tool_run':
      return <FiBox className="w-5 h-5 text-gray-500" />;
    default:
      return <FiBox className="w-5 h-5 text-gray-500" />;
  }
};

export const getArtifactTitle = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const ArtifactRenderer = ({ 
  data, 
  context 
}: { 
  data: any, 
  context?: RenderContext 
}) => {
  if (!data || !data.type) return <DefaultArtifactView data={data} />;

  const content = data.data || data.artifact || data;

  switch (data.type) {
    case 'program_plan':
      return <ProgramPlanView data={content} />;
    case 'research_report':
      return <ResearchReportView data={content} />;
    case 'market_analysis':
      return <MarketAnalysisView data={content} />;
    case 'presentation':
      return <PresentationView data={content} />;
    case 'youtube_transcript':
      return <YouTubeTranscriptView data={content} />;
    case 'todo_list':
      return <TodoListView data={content} />;
    case 'lead_qualification':
      return <LeadQualificationView data={content} />;
    case 'tool_run':
      return <ToolRunView data={content} />;
    case 'meal_suggestions':
      return <MealSuggestionsView data={content} />;
    default:
      return <DefaultArtifactView data={content} />;
  }
};

// Legacy compatibility function if needed by the prompt's design
export function renderArtifact(processedData: any, renderContext: any) {
  return <ArtifactRenderer data={processedData} context={renderContext} />;
}

