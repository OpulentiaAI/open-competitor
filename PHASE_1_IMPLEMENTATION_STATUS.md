# Phase 1 Implementation Status: Convex Agent Integration

## ✅ Completed

### Phase 1.1: Unified MealOutpost Agent (Partial)
**File: `convex/agent_mealoutpost.ts`**

- ✅ Created unified agent definition with `mealPlanTool`
- ✅ Tool properly wraps `api.actions.designProgramPlan`
- ✅ Comprehensive agent instructions for meal planning
- ✅ OpenRouter integration for Claude 3.5 Sonnet
- ⚠️ **Blocked**: Requires Convex Agent component installation

### Phase 1.2: Chat Actions (Partial)
**File: `convex/chat_mealoutpost.ts`**

- ✅ Created `startThread` mutation for new conversations
- ✅ Created `sendMessage` mutation for existing threads
- ✅ Created `generateResponse` internal action for async AI responses
- ✅ Created `listThreadMessages` query for UI rendering
- ✅ Created `getThread` and `listUserThreads` queries
- ⚠️ **Blocked**: Requires Convex Agent component installation

### Phase 2: Normalized Artifacts (Complete)
**Files: `lib/artifacts.ts`, `app/components/ArtifactPanel.tsx`**

- ✅ Added `type: "program_plan"` discriminator to `ProgramPlanArtifactSchema`
- ✅ Updated `designProgramPlan` action to include type field
- ✅ Created `ArtifactPanel` component with `ProgramPlanCard`
- ✅ Beautiful, production-ready artifact renderer
- ✅ Ready for future artifact types (leads, analytics)

## ⚠️ Blockers

### Convex Agent Component Not Installed

The Convex Agent framework requires installing and configuring the `agent` component in your Convex deployment. This is blocking Phase 1.1-1.2 from being fully functional.

**What's needed:**

```bash
# Install the agent component
npx convex@latest components:add @convex-dev/agent

# This will:
# 1. Add component definition to convex.json
# 2. Generate component types in convex/_generated/api.ts
# 3. Create components.agent namespace
```

**Current errors:**
- `Property 'agent' does not exist on type '{}'` in chat_mealoutpost.ts
- `Property 'thread' does not exist` in agent calls
- Missing `components.agent` namespace

## 🎯 Next Steps (In Order)

### Step 1: Install Convex Agent Component
```bash
cd /Users/jeremyalston/Downloads/Component\ paradise/Gesthemane/open-competitor
npx convex components:add @convex-dev/agent
```

After installation:
- Types will be generated in `convex/_generated/`
- `components.agent` will be available
- `mealoutpostAgent` will be functional

### Step 2: Test Agent Integration
1. Start Convex dev: `npx convex dev`
2. Verify agent tools load without errors
3. Test `startThread` mutation via Convex dashboard
4. Verify `mealPlanTool` can be called

### Step 3: Build Frontend Integration (Phase 1.3)
Create a new founder console page that uses:
- `useUIMessages` hook from `@convex-dev/agent/react`
- `startThread` / `sendMessage` mutations
- `ArtifactPanel` for displaying results

### Step 4: Migrate SuperAgent Route
Once Convex Agent is working:
- Keep `/api/superagent` for backwards compatibility
- Route new requests to Convex Agent threads
- Gradually phase out direct OpenRouter calls

## 📋 Implementation Checklist

**Phase 1: Convex Agent**
- [x] Create agent definition (agent_mealoutpost.ts)
- [x] Create chat actions (chat_mealoutpost.ts)
- [ ] Install agent component (`npx convex components:add @convex-dev/agent`)
- [ ] Regenerate types (`npx convex dev`)
- [ ] Test agent in Convex dashboard
- [ ] Create frontend hooks for thread management

**Phase 2: Artifacts**
- [x] Add type discriminator to schema
- [x] Create ArtifactPanel component
- [x] Update designProgramPlan to include type
- [ ] Wire ArtifactPanel into founder console UI

**Phase 3: Additional Tools** (Future)
- [ ] Lead qualification tool
- [ ] Analytics query tool
- [ ] Vendor research tool

**Phase 4: Founder Console** (Future)
- [ ] Create app/founder/page.tsx
- [ ] Left panel: Chat with thread history
- [ ] Right panel: Artifacts sidebar
- [ ] Tool palette

**Phase 5: Reliability** (Future)
- [ ] Add usage tracking
- [ ] Add rate limiting
- [ ] Add error recovery
- [ ] Add audit logs

## 🔧 Files Created/Modified

### New Files
- `convex/agent_mealoutpost.ts` - Unified agent with meal plan tool
- `convex/chat_mealoutpost.ts` - Thread and message management
- `app/components/ArtifactPanel.tsx` - Artifact renderer

### Modified Files
- `lib/artifacts.ts` - Added type discriminator
- `convex/actions.ts` - Added type field to artifact creation

### Dependencies
- `@convex-dev/agent` - Already installed ✅
- Convex Agent Component - **Needs installation** ⚠️

## 📚 Documentation References

- [Convex Agent Component Docs](https://docs.convex.dev/agent)
- [Vercel Agents That Work](https://vercel.com/blog/ai-agents-that-work)
- [Convex Workflows](https://docs.convex.dev/workflows)

## 🎬 Quick Start (After Component Installation)

```typescript
// In your new founder console page
import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArtifactPanel } from "@/app/components/ArtifactPanel";

function FounderConsole() {
  const [threadId, setThreadId] = useState(null);
  const startThread = useMutation(api.chat_mealoutpost.startThread);
  
  const { results: messages } = useUIMessages(
    api.chat_mealoutpost.listThreadMessages,
    threadId ? { threadId } : "skip"
  );

  // ... implement chat UI
}
```

## ⚡ Impact

Once the agent component is installed and Phase 1 is complete:

✅ **Single source of truth** for all conversations (no more ad-hoc routes)
✅ **Persistent threads** with full history and context
✅ **Tool-based architecture** ready for expansion (leads, analytics)
✅ **Production-grade** with retries, streaming, and error handling
✅ **Unified UI** - one assistant for all founder workflows

This aligns with Vercel's production agent patterns and Convex's opinionated agent framework.
