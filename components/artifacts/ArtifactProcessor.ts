import { artifactService } from './ArtifactService';

export class ArtifactProcessor {
  async processArtifactData(rawArtifact: any): Promise<any> {
    // Basic validation
    if (!rawArtifact || !rawArtifact.type) {
      console.warn('Invalid artifact data', rawArtifact);
      return null;
    }

    const definition = artifactService.getDefinition(rawArtifact.type);
    
    // If a custom processor is registered, use it
    if (definition?.processor) {
      return await definition.processor(rawArtifact);
    }

    // Default processing: return as is, but ensure 'artifact' wrapper is handled
    // Some artifacts come as { type: '...', artifact: { ...data... } }
    // Others might be flattened.
    
    let data = rawArtifact.artifact || rawArtifact.payload || rawArtifact;
    
    // Ensure we keep top-level metadata if needed
    if (rawArtifact.createdAt) {
      data._meta = {
        createdAt: rawArtifact.createdAt,
        threadId: rawArtifact.threadId,
        _id: rawArtifact._id
      };
    }

    return {
      type: rawArtifact.type,
      data: data
    };
  }
}

export const artifactProcessor = new ArtifactProcessor();

