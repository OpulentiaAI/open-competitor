import { LegacyAnimationControls as AnimationControls } from 'framer-motion';

export interface DebutConfig {
  delay?: number;
  duration?: number;
  type?: 'slide-in' | 'fade-in' | 'pop';
}

class ArtifactDebutService {
  private debutedArtifacts: Set<string> = new Set();

  public isDebuted(artifactId: string): boolean {
    return this.debutedArtifacts.has(artifactId);
  }

  public markAsDebuted(artifactId: string): void {
    this.debutedArtifacts.add(artifactId);
  }

  public getDebutConfig(type: string): DebutConfig {
    switch (type) {
      case 'presentation':
        return { type: 'slide-in', duration: 0.5 };
      case 'tool_run':
        return { type: 'fade-in', duration: 0.3 };
      default:
        return { type: 'pop', duration: 0.4 };
    }
  }

  public async showDebutAnimation(controls: AnimationControls, config: DebutConfig) {
    const { type, duration = 0.4, delay = 0 } = config;
    
    if (type === 'slide-in') {
      await controls.start({
        x: [50, 0],
        opacity: [0, 1],
        transition: { duration, delay, type: 'spring' }
      });
    } else if (type === 'fade-in') {
      await controls.start({
        opacity: [0, 1],
        transition: { duration, delay }
      });
    } else {
      await controls.start({
        scale: [0.9, 1],
        opacity: [0, 1],
        transition: { duration, delay, type: 'spring' }
      });
    }
  }
}

export const artifactDebut = new ArtifactDebutService();

