import { ReactNode } from 'react';

export type ArtifactType = 
  | 'program_plan'
  | 'lead_qualification'
  | 'search_result'
  | 'tool_run'
  | 'meal_suggestions'
  | 'research_report'
  | 'market_analysis'
  | 'presentation'
  | 'youtube_transcript'
  | 'todo_list'
  | string;

export interface ArtifactDefinition {
  type: ArtifactType;
  component: React.ComponentType<any>;
  icon?: React.ComponentType<any>;
  processor?: (data: any) => any;
}

class ArtifactService {
  private static instance: ArtifactService;
  private registry: Map<string, ArtifactDefinition> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): ArtifactService {
    if (!ArtifactService.instance) {
      ArtifactService.instance = new ArtifactService();
    }
    return ArtifactService.instance;
  }

  public initializeArtifactSystem(): void {
    if (this.initialized) return;
    // Initial setup if needed
    this.initialized = true;
    console.log('Artifact System Initialized');
  }

  public registerArtifactTypes(types: ArtifactDefinition[]): void {
    types.forEach(type => {
      this.registry.set(type.type, type);
    });
  }

  public getDefinition(type: string): ArtifactDefinition | undefined {
    return this.registry.get(type);
  }

  public getAllDefinitions(): ArtifactDefinition[] {
    return Array.from(this.registry.values());
  }
}

export const artifactService = ArtifactService.getInstance();

