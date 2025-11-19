import { Artifact } from './ArtifactTypes';
import { researchReportArtifact } from './definitions/ResearchReportArtifact';
import { programPlanArtifact } from './definitions/ProgramPlanArtifact';
import { marketAnalysisArtifact } from './definitions/MarketAnalysisArtifact';
import { presentationArtifact } from './definitions/PresentationArtifact';
import { youtubeTranscriptArtifact } from './definitions/YouTubeTranscriptArtifact';
import { todoListArtifact } from './definitions/TodoListArtifact';
import { leadQualificationArtifact } from './definitions/LeadQualificationArtifact';
import { toolRunArtifact } from './definitions/ToolRunArtifact';
import { mealSuggestionsArtifact } from './definitions/MealSuggestionsArtifact';

class ArtifactRegistry {
  private registry: Map<string, Artifact> = new Map();

  constructor() {
    this.register(researchReportArtifact);
    this.register(programPlanArtifact);
    this.register(marketAnalysisArtifact);
    this.register(presentationArtifact);
    this.register(youtubeTranscriptArtifact);
    this.register(todoListArtifact);
    this.register(leadQualificationArtifact);
    this.register(toolRunArtifact);
    this.register(mealSuggestionsArtifact);
  }

  register(artifact: Artifact) {
    this.registry.set(artifact.type, artifact);
  }

  get(type: string): Artifact | undefined {
    return this.registry.get(type);
  }

  getAll(): Artifact[] {
    return Array.from(this.registry.values());
  }
}

export const artifactRegistry = new ArtifactRegistry();
