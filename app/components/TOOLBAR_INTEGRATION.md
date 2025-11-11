# Dynamic Toolbar Integration

## Overview

A sophisticated, animated toolbar component has been integrated into the SuperAgent chat interface. The toolbar dynamically expands and contracts based on user interaction, providing quick access to contextual actions and information.

## Features

### ✅ Core Functionality
- **Dynamic Height**: Automatically adjusts height based on content
- **Smooth Animations**: Uses Framer Motion for fluid transitions
- **Click Outside Detection**: Auto-closes when clicking outside the toolbar
- **Persistent State**: Remembers active selection and open/closed state in localStorage
- **Responsive**: Adapts to different screen sizes

### ✅ Default Toolbar Items

1. **Recent Chats** (History Icon)
   - View recent conversation history
   - Quick access to previous MealOutpost, Presentation, and Sheets chats
   - "View All History" action

2. **Quick Actions** (Message Icon)
   - Pre-defined quick prompts:
     - 📊 Analyze data
     - 🎨 Create presentation
     - 🔍 Search meals
   - "Customize Actions" button

3. **Documents** (Folder Icon)
   - Recent documents list:
     - Q4_Report.pdf
     - Sales_Data.xlsx
     - Meeting_Notes.docx
   - "Manage Documents" action

4. **Templates** (BookOpen Icon)
   - Saved template library:
     - Business Proposal
     - Marketing Plan
     - Project Timeline
   - "Browse Templates" action

5. **Schedule** (Calendar Icon)
   - Today's schedule overview
   - Time-based events display
   - "View Calendar" action

6. **Settings** (Settings Icon)
   - Quick preferences:
     - Dark Mode toggle
     - Notifications toggle
     - Auto-save toggle
   - "Advanced Settings" action

## Components Created

### 1. `useClickOutside` Hook
**Location:** `/hooks/useClickOutside.ts`

A reusable React hook that detects clicks outside a specified element.

```typescript
import useClickOutside from '@/hooks/useClickOutside';

const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => {
  // Handler called when clicking outside
  setIsOpen(false);
});
```

**Features:**
- Handles both mouse and touch events
- Properly cleans up event listeners
- TypeScript typed for HTMLElement

### 2. `ToolbarExpandable` Component
**Location:** `/app/components/ToolbarExpandable.tsx`

The main toolbar component with expandable content panels.

```typescript
import ToolbarExpandable from './ToolbarExpandable';

<ToolbarExpandable 
  items={customItems}
  onActionClick={(action, itemId) => {
    console.log(`Action: ${action}, Item: ${itemId}`);
  }}
/>
```

**Props:**
- `items?: ToolbarItem[]` - Custom toolbar items (uses defaults if not provided)
- `onActionClick?: (action: string, itemId: number) => void` - Callback when item is clicked

**ToolbarItem Interface:**
```typescript
interface ToolbarItem {
  id: number;
  label: string;
  title: React.ReactNode;  // Icon or title to display
  content: React.ReactNode; // Expanded content
}
```

## Integration

The toolbar has been integrated into the **SuperAgent** component and appears at the bottom center of the screen.

### Location in SuperAgent
```typescript
// app/components/SuperAgent.tsx
import ToolbarExpandable from './ToolbarExpandable';

return (
  <div className={clsx('flex h-screen bg-gray-50 relative', className)}>
    {/* ...existing chat interface... */}
    
    {/* Dynamic Toolbar */}
    <ToolbarExpandable />
  </div>
);
```

## State Persistence

The toolbar automatically persists its state to localStorage:

### Stored Keys:
- **`toolbar_active`**: Currently active item ID
- **`toolbar_isOpen`**: Whether toolbar is expanded

### Storage Logic:
```typescript
// Save active item
localStorage.setItem('toolbar_active', String(active));

// Save open state
localStorage.setItem('toolbar_isOpen', String(isOpen));

// Load on mount
useEffect(() => {
  const savedActive = localStorage.getItem('toolbar_active');
  const savedIsOpen = localStorage.getItem('toolbar_isOpen');
  
  if (savedActive) setActive(Number(savedActive));
  if (savedIsOpen === 'true') setIsOpen(true);
}, []);
```

## Styling

### Position & Layout
- **Position**: Fixed at bottom center (`bottom-8`)
- **Z-Index**: 50 (appears above most content)
- **Background**: White with shadow
- **Border**: Subtle gray border with rounded corners

### Animation
- **Type**: Spring animation
- **Bounce**: 0.1 (subtle)
- **Duration**: 0.25s
- **Behavior**: Smooth expand/collapse

### Responsive Design
- Adapts container width based on content
- Icons: 36px × 36px (h-9 w-9)
- Padding: Consistent 8px (p-2)
- Gap: 8px between items (space-x-2)

## Customization

### Adding Custom Items

```typescript
const customItems: ToolbarItem[] = [
  {
    id: 1,
    label: 'My Custom Action',
    title: <CustomIcon className='h-5 w-5' />,
    content: (
      <div className='flex flex-col space-y-4'>
        <div className='text-zinc-700'>Custom content here</div>
        <button className='...'>Action Button</button>
      </div>
    ),
  },
  // ... more items
];

<ToolbarExpandable items={customItems} />
```

### Handling Actions

```typescript
<ToolbarExpandable 
  onActionClick={(action, itemId) => {
    switch(itemId) {
      case 1:
        // Handle recent chats
        navigateToHistory();
        break;
      case 2:
        // Handle quick actions
        executeQuickAction(action);
        break;
      // ... more cases
    }
  }}
/>
```

### Styling Customization

Update the component's Tailwind classes:

```typescript
// Change position
className='fixed bottom-4 right-4 z-50' // Bottom-right corner

// Change colors
className='bg-zinc-900 text-white' // Dark theme

// Change size
className='h-12 w-12' // Larger icons
```

## Dependencies

### Required Package
```json
{
  "react-use-measure": "^2.1.1"
}
```

**Install command:**
```bash
npm install react-use-measure
```

**Purpose:** Provides the `useMeasure` hook for dynamic dimension calculation

### Existing Dependencies
- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `@/lib/utils`: Contains `cn` utility for class merging

## Usage Examples

### Basic Usage (Default Items)
```typescript
import ToolbarExpandable from '@/app/components/ToolbarExpandable';

function MyComponent() {
  return (
    <div className='relative h-screen'>
      {/* Your content */}
      <ToolbarExpandable />
    </div>
  );
}
```

### With Custom Items
```typescript
const myItems = [
  {
    id: 1,
    label: 'Notifications',
    title: <Bell className='h-5 w-5' />,
    content: <NotificationPanel />,
  },
  {
    id: 2,
    label: 'Profile',
    title: <User className='h-5 w-5' />,
    content: <ProfileCard />,
  },
];

<ToolbarExpandable items={myItems} onActionClick={handleAction} />
```

### With Action Handlers
```typescript
const handleToolbarAction = (action: string, itemId: number) => {
  console.log(`User clicked ${action} (ID: ${itemId})`);
  
  // Execute custom logic
  if (itemId === 2) {
    router.push('/quick-actions');
  }
};

<ToolbarExpandable onActionClick={handleToolbarAction} />
```

## Technical Details

### Animation Flow
1. User clicks toolbar icon
2. `isOpen` state changes to `true`
3. Height animates from 0 to `heightContent` (measured by `useMeasure`)
4. Content fades in with opacity animation
5. Previous content fades out simultaneously

### State Management
- **Local State**: `useState` for active item and open/closed state
- **Refs**: For click-outside detection and dimension measurement
- **Effects**: For localStorage persistence and dimension updates

### Performance Optimizations
- Lazy content rendering (only active item is visible)
- Dimension measurement cached until content changes
- Event listeners properly cleaned up on unmount
- Smooth animations with GPU-accelerated transforms

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- **ARIA Labels**: Each button has `aria-label` for screen readers
- **Keyboard Navigation**: Supports `Tab` and `Enter` keys
- **Focus Indicators**: Visible focus rings on interactive elements
- **Semantic HTML**: Proper button elements with type attributes

## Troubleshooting

### Toolbar Not Appearing
- Check that `react-use-measure` is installed
- Verify component is rendered inside a positioned container
- Ensure z-index is high enough

### State Not Persisting
- Check localStorage is enabled in browser
- Verify no errors in browser console
- Check localStorage quota isn't exceeded

### Animation Stuttering
- Reduce number of toolbar items
- Simplify content inside expanded panels
- Check for excessive re-renders

## Future Enhancements

- [ ] Keyboard shortcuts for each toolbar item
- [ ] Drag to reorder toolbar icons
- [ ] Toolbar themes (light/dark)
- [ ] Position customization (top/bottom/left/right)
- [ ] Mobile-optimized drawer variant
- [ ] Toolbar grouping and categories
- [ ] Search within toolbar items
- [ ] Badge notifications on icons

---

**Status:** ✅ Fully Integrated and Functional
**Version:** 1.0.0
**Last Updated:** Current session
