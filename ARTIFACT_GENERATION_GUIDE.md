# Artifact Generation & Thinking UI Guide

This guide documents the artifact generation system, including the new "Sparka-like" architecture, interactive views, and the streaming reasoning UI.

## 1. Architecture Overview

The artifact system has been refactored to move away from a simple switch-statement renderer to a robust, registry-based class system. This allows for:
- **Encapsulation**: Each artifact defines its own components, actions, toolbar items, and metadata.
- **Single-Artifact Workspace**: A focused "Deep Work" mode when an artifact is expanded.
- **Extensibility**: Easy to add new artifact types without touching the main renderer.

### Key Components
- **`ArtifactTypes.ts`**: Defines the `Artifact` class and interfaces.
- **`ArtifactRegistry.ts`**: Singleton registry that manages all available artifact definitions.
- **`ArtifactPanelNew.tsx`**: The new workspace view for expanded artifacts, supporting headers, actions, and toolbars.
- **`ArtifactPanel.tsx`**: The legacy list view that now delegates to `ArtifactPanelNew` when an artifact is expanded.

### Code Snippet: Defining a New Artifact
```typescript
import { Artifact } from '../ArtifactTypes';
import { MyCustomView } from '../views/MyCustomView';
import { FiStar } from 'react-icons/fi';

export const myCustomArtifact = new Artifact({
  type: 'my_custom_type',
  title: 'Custom Artifact',
  description: 'Description of what this artifact does.',
  component: MyCustomView,
  icon: <FiStar />,
  actions: [
    {
      icon: <FiCopy />,
      description: 'Copy Content',
      onClick: ({ data }) => navigator.clipboard.writeText(data.content)
    }
  ]
});
```

## 2. Thinking UI (Reasoning Process)

We now support streaming "thought chains" from the AI. This helps users understand *how* the AI is arriving at an answer.

### How it Works
- The AI outputs reasoning within `<think>...</think>` tags.
- **`MessageBubble`** (in `SuperAgent.tsx`) parses these tags in real-time.
- **`ThinkingBlock`** component renders the reasoning in a collapsible, distinct UI block above the final answer.
- Supports **streaming animations** (pulsing icon) while the thought process is generating.

## 3. Artifact Uniqueness & Views

Each artifact view has been enhanced to provide a unique, app-like experience.

### 📊 Tool Run / Sheets View (`ToolRunView.tsx`)
* **Uniqueness**: Automatically detects tabular data (arrays of objects) and renders a **sticky-header data table**.
* **Use Case**: Displaying CSV data, financial models, or list outputs from tools.
* **Fallback**: graceful degradation to a JSON/Status view for non-tabular data.

### 🍽️ Meal Suggestions (`MealSuggestionsView.tsx`)
* **Uniqueness**: **Rich Card Layout**. Displays meals like a food delivery app (DoorDash/UberEats style).
* **Features**: 
  - Hero images with price overlays.
  - Restaurant ratings and cuisine types.
  - "View Details" actions.

### 📽️ Presentation Deck (`PresentationView.tsx`)
* **Uniqueness**: **Interactive Slide Deck**. Not just a list of text, but a fully navigable presentation.
* **Features**:
  - Next/Previous navigation controls.
  - Smooth slide transitions (Framer Motion).
  - Fullscreen mode toggle.
  - Renders Title, Bullets, and Content sections dynamically.

### 📑 Research Report (`ResearchReportView.tsx`)
* **Uniqueness**: Focused on structure and sources.
* **Features**: 
  - distinct "Focus Areas" pills.
  - Source citations with external links.

### 📈 Market Analysis (`MarketAnalysisView.tsx`)
* **Uniqueness**: Strategic dashboard view.
* **Features**: Separates "Trends" and "Opportunities" into a clear grid layout.

## 4. Dependencies

The new system relies on the following key libraries:

| Package | Usage |
| :--- | :--- |
| `framer-motion` | Interactive slide transitions, modal expansions, thinking block animations. |
| `react-icons` | Consistent iconography for artifacts and actions. |
| `react-markdown` | Rendering rich text content within artifacts and messages. |
| `clsx` | Conditional class merging for dynamic UI states. |

## 5. Integration Guide

To add this system to another part of the app:

1. **Import the Registry**:
   ```typescript
   import { artifactRegistry } from '@/components/artifacts/ArtifactRegistry';
   ```

2. **Render the Panel**:
   ```tsx
   <ArtifactPanel 
     artifacts={myArtifactData} 
     title="Project Files" 
   />
   ```

3. **Stream Reasoning**:
   Ensure your LLM prompt includes instructions to use `<think>` tags for reasoning steps. The frontend `SuperAgent` component handles the rest automatically.
