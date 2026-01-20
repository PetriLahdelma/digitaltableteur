# Donny Memory Architecture

> **Purpose**: Technical specification for user recognition, memory persistence, and GDPR-compliant personalization.

---

## 1. Memory Levels Overview

| Level | Authentication | Storage | Retention | Use Case |
|-------|----------------|---------|-----------|----------|
| **L1: Pseudonymous** | Cookie/localStorage | Client + minimal server | 90 days | Returning visitors |
| **L2: Account** | Magic link / OAuth | Server (encrypted) | Indefinite | Active customers |
| **L3: Relationship** | Explicit profile | Server + CRM | Indefinite | Retainer clients |

**Recommendation**: Ship L1 first, offer optional upgrade to L2.

---

## 2. Data Models

### 2.1 Users Table

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication
  email VARCHAR(255) UNIQUE,  -- NULL for L1 pseudonymous
  auth_provider VARCHAR(50),  -- 'magic_link', 'google', 'github', NULL
  
  -- Consent
  consent_status VARCHAR(20) NOT NULL DEFAULT 'none',
    -- 'none' | 'essential' | 'personalization' | 'full'
  consent_updated_at TIMESTAMP,
  
  -- Tracking
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Pseudonymous identifier (L1)
  anonymous_id VARCHAR(64),  -- Client-generated, persisted in cookie
  
  -- Soft delete
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX idx_users_email ON users(email);
```

### 2.2 User Profiles Table

```sql
CREATE TABLE user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Communication preferences
  preferred_tone VARCHAR(20) DEFAULT 'concise',
    -- 'concise' | 'detailed' | 'structured' | 'casual'
  preferred_language VARCHAR(5) DEFAULT 'en',
    -- 'en' | 'fi' | 'sv'
  
  -- Work context
  typical_projects JSONB DEFAULT '[]',
    -- ['brand', 'ui_audit', 'pitch_deck', 'website']
  typical_stack JSONB DEFAULT '[]',
    -- ['react', 'nextjs', 'figma', 'typescript']
  
  -- Constraints
  budget_band VARCHAR(20),
    -- 'starter' | 'growth' | 'enterprise' | NULL
  timeline_preference VARCHAR(20),
    -- 'asap' | 'flexible' | 'scheduled' | NULL
  
  -- Do not ask again
  skip_questions JSONB DEFAULT '[]',
    -- ['budget', 'timeline', 'stack']
  
  -- Metadata
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

### 2.3 Memories Table

```sql
CREATE TABLE memories (
  memory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Memory content
  type VARCHAR(30) NOT NULL,
    -- 'preference' | 'project' | 'fact' | 'do_not_ask' | 'feedback'
  category VARCHAR(50),
    -- 'design', 'development', 'brand', 'personal', 'constraint'
  content TEXT NOT NULL,
    -- Short, actionable text (max 500 chars)
  
  -- Relevance scoring
  importance INTEGER DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    -- 1 = low, 5 = critical
  
  -- Embedding for vector search
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
  
  -- Lifecycle
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,  -- NULL = never expires
  
  -- Source
  source_conversation_id UUID,
  source_message_id VARCHAR(100)
);

CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);
```

### 2.4 Conversation Summaries Table

```sql
CREATE TABLE conversation_summaries (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  
  -- Summary content
  title VARCHAR(200),  -- Auto-generated: "Brand guidelines discussion"
  summary TEXT NOT NULL,  -- Condensed version (max 1000 chars)
  key_decisions JSONB DEFAULT '[]',
    -- ['chose minimal style', 'budget confirmed 5k']
  action_items JSONB DEFAULT '[]',
    -- ['send moodboard', 'schedule call']
  
  -- Context
  message_count INTEGER,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Embedding for retrieval
  embedding VECTOR(1536),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summaries_user_id ON conversation_summaries(user_id);
CREATE INDEX idx_summaries_embedding ON conversation_summaries USING ivfflat (embedding vector_cosine_ops);
```

---

## 3. TypeScript Interfaces

```typescript
// types/memory.ts

export type ConsentStatus = 'none' | 'essential' | 'personalization' | 'full';

export type MemoryType = 
  | 'preference'   // User preferences (tone, style)
  | 'project'      // Active/past project info
  | 'fact'         // Stated facts about user/company
  | 'do_not_ask'   // Skip these questions
  | 'feedback';    // Positive/negative reactions

export type TonePreference = 'concise' | 'detailed' | 'structured' | 'casual';

export interface User {
  userId: string;
  email?: string;
  consentStatus: ConsentStatus;
  anonymousId?: string;
  createdAt: Date;
  lastSeenAt: Date;
}

export interface UserProfile {
  userId: string;
  preferredTone: TonePreference;
  preferredLanguage: 'en' | 'fi' | 'sv';
  typicalProjects: string[];
  typicalStack: string[];
  budgetBand?: 'starter' | 'growth' | 'enterprise';
  timelinePreference?: 'asap' | 'flexible' | 'scheduled';
  skipQuestions: string[];
}

export interface Memory {
  memoryId: string;
  userId: string;
  type: MemoryType;
  category?: string;
  content: string;
  importance: 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
  lastAccessedAt?: Date;
  accessCount: number;
  expiresAt?: Date;
}

export interface ConversationSummary {
  summaryId: string;
  userId: string;
  conversationId: string;
  title: string;
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  messageCount: number;
  startedAt: Date;
  endedAt: Date;
}

// Context passed to AI model
export interface DonnyContext {
  user: {
    isReturning: boolean;
    profile?: UserProfile;
    daysSinceLastVisit?: number;
  };
  memories: Memory[];
  recentSummaries: ConversationSummary[];
  memoryRules: string[];
}
```

---

## 4. Memory Retrieval Logic

### 4.1 Context Assembly (Per Request)

```typescript
// lib/donny/memory-retrieval.ts

import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const MAX_MEMORIES = 15;
const MAX_SUMMARIES = 3;

export async function assembleDonnyContext(
  userId: string,
  currentMessage: string
): Promise<DonnyContext> {
  // 1. Load user profile
  const profile = await getUserProfile(userId);
  
  // 2. Get embedding for current message
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: currentMessage,
  });
  
  // 3. Retrieve relevant memories via vector search
  const memories = await getRelevantMemories(userId, embedding, MAX_MEMORIES);
  
  // 4. Get recent conversation summaries
  const summaries = await getRecentSummaries(userId, MAX_SUMMARIES);
  
  // 5. Build context object
  return {
    user: {
      isReturning: await isReturningUser(userId),
      profile,
      daysSinceLastVisit: await getDaysSinceLastVisit(userId),
    },
    memories,
    recentSummaries: summaries,
    memoryRules: getMemoryRules(profile),
  };
}

function getMemoryRules(profile?: UserProfile): string[] {
  const rules = [
    'Reference memories naturally, never list them',
    'If a memory seems outdated, ask "Still true?"',
    'Never mention sensitive/personal data unprompted',
  ];
  
  if (profile?.preferredTone === 'concise') {
    rules.push('Keep responses brief—user prefers concise communication');
  }
  
  if (profile?.skipQuestions?.length) {
    rules.push(`Don't ask about: ${profile.skipQuestions.join(', ')}`);
  }
  
  return rules;
}
```

### 4.2 Memory Extraction (Post-Conversation)

```typescript
// lib/donny/memory-extraction.ts

import { generateObject } from 'ai';
import { z } from 'zod';

const ExtractedMemoriesSchema = z.object({
  memories: z.array(z.object({
    type: z.enum(['preference', 'project', 'fact', 'do_not_ask', 'feedback']),
    content: z.string().max(500),
    importance: z.number().min(1).max(5),
    category: z.string().optional(),
  })),
  summary: z.object({
    title: z.string().max(200),
    summary: z.string().max(1000),
    keyDecisions: z.array(z.string()),
    actionItems: z.array(z.string()),
  }),
});

export async function extractMemories(
  conversation: Message[],
  existingMemories: Memory[]
): Promise<z.infer<typeof ExtractedMemoriesSchema>> {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: ExtractedMemoriesSchema,
    prompt: `
      Analyze this conversation and extract:
      1. New memories worth saving (preferences, facts, constraints)
      2. A brief summary with key decisions and action items
      
      Existing memories (avoid duplicates):
      ${existingMemories.map(m => `- ${m.content}`).join('\n')}
      
      Conversation:
      ${conversation.map(m => `${m.role}: ${m.content}`).join('\n')}
      
      Rules:
      - Only extract genuinely useful information
      - Importance 5 = critical constraint (budget, deadline)
      - Importance 1 = nice-to-know preference
      - Keep content actionable and concise
    `,
  });
  
  return object;
}
```

---

## 5. Consent & Privacy (GDPR)

### 5.1 Consent Banner Flow

```typescript
// components/ConsentBanner/ConsentBanner.tsx

export type ConsentLevel = 'essential' | 'personalization' | 'full';

interface ConsentBannerProps {
  onConsent: (level: ConsentLevel) => void;
  onReject: () => void;
}

// User sees:
// "Donny can remember your preferences to personalize your experience."
// [Essential Only] [Personalize] [Full Features]
// 
// Essential: Just functional cookies
// Personalize: + preferences & project memory
// Full: + conversation history & summaries
```

### 5.2 Memory Control Panel

```typescript
// components/MemoryPanel/MemoryPanel.tsx

interface MemoryPanelProps {
  userId: string;
}

// Sections:
// 1. "What Donny Remembers"
//    - List of memories with delete buttons
//    - Filter by type (preferences, projects, facts)
//
// 2. "Your Preferences"
//    - Tone: concise / detailed / structured
//    - Skip questions: checkboxes
//
// 3. "Privacy Controls"
//    - [Forget Everything] → Deletes all memories
//    - [Export My Data] → Downloads JSON
//    - [Pause Personalization] → Temporary disable
//
// 4. "Retention"
//    - Auto-delete after: 30 / 90 / 180 days / Never
```

### 5.3 Data Retention Policy

| Data Type | L1 Pseudonymous | L2 Account | L3 Relationship |
|-----------|-----------------|------------|-----------------|
| Preferences | 90 days | Indefinite | Indefinite |
| Project memories | 90 days | 1 year | Indefinite |
| Conversation summaries | 30 days | 6 months | Indefinite |
| Full conversation logs | Not stored | 30 days | 90 days |

### 5.4 Right to Deletion

```typescript
// api/user/forget/route.ts

export async function DELETE(request: Request) {
  const { userId } = await auth();
  
  // Cascade delete all user data
  await db.transaction(async (tx) => {
    await tx.delete(memories).where(eq(memories.userId, userId));
    await tx.delete(conversationSummaries).where(eq(conversationSummaries.userId, userId));
    await tx.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await tx.update(users)
      .set({ deletedAt: new Date(), email: null, anonymousId: null })
      .where(eq(users.userId, userId));
  });
  
  // Clear client storage
  return new Response(null, {
    status: 204,
    headers: {
      'Clear-Site-Data': '"cookies", "storage"',
    },
  });
}
```

---

## 6. UX Patterns

### 6.1 Recognition Moments

| Scenario | Donny Says | Avatar State |
|----------|------------|--------------|
| **First return visit** | "Welcome back. Continue where we left off?" | `greeting` → `remembering` |
| **Using saved preference** | "Using your saved style: concise + dev-ready." | `acknowledging` |
| **Memory might be stale** | "Last time you mentioned X—still true?" | `curious` |
| **Offering to remember** | "Want me to remember this for next time?" | `suggesting` |
| **After deletion** | "Got it—starting fresh." | `acknowledging` |

### 6.2 Memory UI Indicators

```tsx
// Visual indicator when memory is being used
<MemoryIndicator>
  <Icon name="memory" size={12} />
  <span>Using saved preferences</span>
  <button onClick={showMemoryPanel}>Edit</button>
</MemoryIndicator>
```

### 6.3 What NOT to Do

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| "Hey Pete! I remember your salary..." | Reference only relevant, non-sensitive info |
| Show all memories in chat | Provide a separate Memory Panel |
| Auto-personalize without consent | Ask first, explain benefit |
| Store full conversation logs | Store compact summaries only |

---

## 7. Implementation Phases

### Phase 1: Avatar + Personality (1-2 days)
- [ ] Create Donny character spec ✅
- [ ] Design 8 core state SVGs
- [ ] Implement `DonnyAvatar` React component
- [ ] Add to ChatWidget header
- [ ] State machine for transitions

### Phase 2: Pseudonymous Memory (2-4 days)
- [ ] Consent banner component
- [ ] `user_id` cookie persistence
- [ ] LocalStorage for preferences
- [ ] Memory settings panel
- [ ] Basic memory types: tone, projects, skip_questions

### Phase 3: Context Assembly (2-3 days)
- [ ] Database tables setup
- [ ] Memory retrieval API
- [ ] Vector embeddings for memories
- [ ] Inject context into Donny prompts
- [ ] Memory extraction post-conversation

### Phase 4: Account Upgrade (3-5 days)
- [ ] Magic link authentication
- [ ] OAuth providers (Google, GitHub)
- [ ] Data export endpoint
- [ ] Extended retention
- [ ] Conversation summaries

---

## 8. System Prompt Integration

```typescript
// lib/donny/system-prompt.ts

export function buildDonnySystemPrompt(context: DonnyContext): string {
  const base = digitaltableteurContext; // Existing context
  
  const memorySection = context.memories.length > 0 ? `
## User Context
${context.user.isReturning ? 'Returning user.' : 'New user.'}
${context.user.profile?.preferredTone ? `Prefers ${context.user.profile.preferredTone} communication.` : ''}

## Relevant Memories
${context.memories.map(m => `- [${m.type}] ${m.content}`).join('\n')}

## Memory Rules
${context.memoryRules.map(r => `- ${r}`).join('\n')}
` : '';

  const summarySection = context.recentSummaries.length > 0 ? `
## Recent Conversations
${context.recentSummaries.map(s => `- ${s.title}: ${s.summary}`).join('\n')}
` : '';

  return `${base}\n${memorySection}\n${summarySection}`;
}
```

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Author: Digitaltableteur*
