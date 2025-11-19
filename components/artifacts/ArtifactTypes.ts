import { ComponentType, ReactNode, Dispatch, SetStateAction } from 'react';

export type ArtifactMode = 'edit' | 'diff' | 'view';

export interface ArtifactActionContext<T = any> {
  data: T;
  mode: ArtifactMode;
  // Versioning support
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  
  // Metadata support
  metadata: any;
  setMetadata: Dispatch<SetStateAction<any>>;
  
  isReadonly?: boolean;
}

export interface ArtifactAction<T = any> {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ArtifactActionContext<T>) => void | Promise<void>;
  isDisabled?: (context: ArtifactActionContext<T>) => boolean;
}

export interface ArtifactToolbarContext {
  // Allow actions to interact with the main app (e.g. send messages)
  sendMessage: (message: any) => void; 
  storeApi: any; 
}

export interface ArtifactToolbarItem {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ArtifactToolbarContext) => void;
}

export interface ArtifactContentProps<T = any> {
  data: T;
  mode: ArtifactMode;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  isReadonly?: boolean;
  isLoading?: boolean;
  
  // Metadata
  metadata: any;
  setMetadata: Dispatch<SetStateAction<any>>;
  
  // Callbacks
  onSave?: (data: T) => void;
}

export interface ArtifactConfig<T = any> {
  type: string;
  title: string;
  description?: string;
  component: ComponentType<ArtifactContentProps<T>>;
  icon?: ReactNode; 
  actions?: ArtifactAction<T>[];
  toolbar?: ArtifactToolbarItem[];
  
  // Lifecycle methods
  initialize?: (context: {
    data: T;
    setMetadata: Dispatch<SetStateAction<any>>;
  }) => void | Promise<void>;
  
  onStreamPart?: (context: {
    streamPart: any;
    setMetadata: Dispatch<SetStateAction<any>>;
    setData: Dispatch<SetStateAction<T>>;
  }) => void;
}

export class Artifact<T = any> {
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly component: ComponentType<ArtifactContentProps<T>>;
  readonly icon?: ReactNode;
  readonly actions: ArtifactAction<T>[];
  readonly toolbar: ArtifactToolbarItem[];
  readonly initialize?: ArtifactConfig<T>['initialize'];
  readonly onStreamPart?: ArtifactConfig<T>['onStreamPart'];

  constructor(config: ArtifactConfig<T>) {
    this.type = config.type;
    this.title = config.title;
    this.description = config.description || '';
    this.component = config.component;
    this.icon = config.icon;
    this.actions = config.actions || [];
    this.toolbar = config.toolbar || [];
    this.initialize = config.initialize;
    this.onStreamPart = config.onStreamPart;
  }
}
