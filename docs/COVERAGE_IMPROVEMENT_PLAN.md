# Storybook Test Coverage Improvement - Efficiency Plan

## 🚨 QUICK START (TL;DR)

**Current**: 45% coverage | **Target**: 85% | **Gap**: 40 points

### ⚡ DO THIS RIGHT NOW (120 minutes → 85% coverage)

1. **ChatWidget** (45 min) → +10-15% → 55-60% total
2. **SplitButton** (30 min) → +6-9% → 61-69% total
3. **ContactForm** (25 min) → +5-8% → 66-77% total
4. **Avatar** (20 min) → +4-6% → **70-83% total** ✅

**Stop here if ≥85%**. Otherwise continue:

5. **NextHeader** (20 min) → +3-5% → 73-88% total
6. **EmailWorkflow** (30 min) → +4-6% → **77-94% total** ✅✅

---

## Current Status (Updated: December 5, 2025 - EFFICIENCY PIVOT)

- **Current Coverage**: 45.82% lines, 39.41% functions, 45.46% branches
- **Target Coverage**: 85%
- **Gap**: ~40 percentage points
- **Previous Progress**: +3% after many hours (INEFFICIENT)
- **New Strategy**: Focus on high-impact, low-effort wins

## ⚠️ EFFICIENCY ANALYSIS

### Problem Identified

Working on already-high-coverage components (76-81%) yields minimal gains:

- Time spent: Hours
- Coverage gain: 3%
- ROI: **VERY LOW**

### New Focus: HIGH-IMPACT TARGETS

Target components with **LOW coverage + HIGH complexity** for maximum gains

## Changes Made

### 1. Configuration Updates

**File**: `vitest.config.mts`

- ✅ Added dedicated coverage configuration for Storybook project
- ✅ Set `reportsDirectory: "coverage-storybook"`
- ✅ Added `optimizeDeps.include` to prevent Vite reload issues
- ✅ Excluded `app/` and page files from component coverage
- ✅ Set coverage thresholds to 85% for all metrics

### 2. Play Functions Added

#### ✅ **SplitButton** (was 25%)

- Added `.play` to `Default` story
- Tests menu opening, option selection

#### ✅ **Tabs** (was 36%)

- Added `.play` to `Default`, `Pills`, `Underline`, `WithDisabled` stories
- Tests tab switching, keyboard navigation, disabled tab behavior
- Uses aria-selected assertions

#### ✅ **Switch** (needs checking)

- Added `.play` to `Default`, `LabelOnTop`, `LabelOnLeft`, `WithHelperText` stories
- Tests toggle on/off with aria-checked assertions

#### ✅ **CodeSnippet** (was 56%)

- Added `.play` to `Single` and `Multi` stories
- Tests copy button functionality

#### ✅ **Modal** (was 76%)

- Added `.play` to `Default` story
- Tests modal open/close, dialog role, close button

#### ✅ **FileUpload** (was 43%) - NEW SESSION

- Added `.play` to `Default` story
- Tests file input button interaction

#### ✅ **ContactForm** (was 35%) - NEW SESSION

- Added `.play` to `Default` and `InModal` stories
- Tests all form fields (name, email, message)

#### ✅ **SecureCVDownload** (was 26%) - NEW SESSION

- Added `.play` to `Default`, `CustomText`, `Secondary`, `Inverse` stories
- Tests modal opening, password input

#### ✅ **NewsletterWaitlist** (was 41%) - NEW SESSION

- Added `.play` to `Default` and `WithCallbacks` stories
- Tests email input, submit button interaction

#### ✅ **ChatWidget** (was 44%) - NEW SESSION

- Added `.play` to `Playground` story
- Tests chat bubble opening, message typing

#### ✅ **Accordion** (was 81%) - NEW SESSION

- Added `.play` to `Default` story
- Tests expand/collapse interactions with content verification

#### ✅ **CheckboxGroup** (76-80%) - NEW SESSION

- Enhanced existing `.play` for `WithoutMasterCheckbox` story
- Tests checkbox selection

#### ✅ **Badge** (was 66%)

- Already had `.play` functions (Playground, AllVariants, AllSizes)

#### ✅ **Avatar** (was 64%)

- Already had `.play` functions (WithImage, WithInitials, WithMenu, EdgeDetection)

## 🎯 DATA-DRIVEN PRIORITY LIST (Based on Actual Coverage)

### Tier 1: MASSIVE IMPACT (Do These First) 🎯

**Criteria**: Large files (100+ lines), low coverage (<60%), highest potential gains

1. **ChatWidget** - **333 lines, 51% coverage** ❌❌❌
   - **Current**: 51% lines, 71% functions, **27% branches** (HUGE gap!)
   - **Potential gain**: +10-15% overall coverage
   - **Time**: 40-50 min
   - **Why**: Largest component, lowest branch coverage, complex state
   - **Focus**: Message flows, error states, loading states

2. **SplitButton** - **189 lines, 57% coverage** ❌❌
   - **Current**: 57% lines, 68% functions, **43% branches**
   - **Potential gain**: +6-9% overall coverage
   - **Time**: 25-35 min
   - **Why**: Complex menu logic, collision detection untested
   - **Focus**: Menu open/close, keyboard nav, all options

3. **Avatar** - **165 lines, 65% coverage** ⚠️
   - **Current**: 65% lines, 59% functions, 57% branches
   - **Potential gain**: +4-6% overall coverage
   - **Time**: 20-25 min
   - **Why**: Menu interactions need more coverage
   - **Focus**: All menu options, keyboard nav, collision edge cases

4. **ContactForm** - **134 lines, 38% coverage** ❌❌❌
   - **Current**: 38% lines, 38% functions, **17% branches** (VERY LOW!)
   - **Potential gain**: +5-8% overall coverage
   - **Time**: 25-30 min
   - **Why**: Critical form, very low branch coverage
   - **Focus**: Validation, submission, error handling

### Tier 2: HIGH IMPACT (Do After Tier 1) 🔥

**Criteria**: Medium files (50-100 lines), low coverage, good ROI

5. **NextHeader** - **94 lines, 0% coverage** ❌❌❌
   - **Current**: 0% everything
   - **Potential gain**: +3-5% overall coverage
   - **Time**: 20-25 min
   - **Why**: Navigation is critical, currently untested
   - **Focus**: Mobile menu, desktop nav, logo click

6. **SecureCVDownload** - **81 lines, 43% coverage** ⚠️
   - **Current**: 43% lines, 67% functions, 39% branches
   - **Potential gain**: +3-4% overall coverage
   - **Time**: 15-20 min
   - **Focus**: Password validation, download flow

7. **SocialShare** - **64 lines, 41% coverage** ⚠️
   - **Current**: 41% lines, 45% functions, 34% branches
   - **Potential gain**: +2-3% overall coverage
   - **Time**: 10-15 min
   - **Focus**: Native share API, clipboard fallback

8. **NewsletterWaitlist** - **51 lines, 43% coverage** ⚠️
   - **Current**: 43% lines, 38% functions, 67% branches
   - **Potential gain**: +2-3% overall coverage
   - **Time**: 10-15 min
   - **Focus**: Email validation, submission

### Tier 3: SPECIALIZED TARGETS 🎲

**Criteria**: Components with specific gaps

9. **EmailWorkflow components** - Multiple files, 8-35% coverage ❌
   - **Potential gain**: +4-6% overall coverage
   - **Time**: 30-40 min for all
   - **Files**: FieldPrompt, ReviewSummary, SendStatus, reducer
   - **Focus**: Multi-step form flow

10. **Page components (0% coverage)** - Multiple 28-46 line files ⚠️
    - **Potential gain**: +3-5% overall coverage
    - **Time**: 20-30 min for batch
    - **Files**: AboutPage, AccessibilityPage, ContactPage, HomePage
    - **Focus**: Basic rendering, i18n

## 🚀 OPTIMIZED EXECUTION PLAN

### Phase 1: Maximum Impact Sprint (120 minutes)

**Goal**: +25-35% coverage 🎯

| Component   | Time   | Coverage Gain | Priority |
| ----------- | ------ | ------------- | -------- |
| ChatWidget  | 45 min | +10-15%       | CRITICAL |
| SplitButton | 30 min | +6-9%         | CRITICAL |
| ContactForm | 25 min | +5-8%         | HIGH     |
| Avatar      | 20 min | +4-6%         | HIGH     |

**Expected Total**: **+25-38% coverage** → **70-83% overall** ✅

### Phase 2: Clean-Up Sprint (60 minutes)

**Goal**: +8-12% coverage 🔥

| Component     | Time   | Coverage Gain | Priority |
| ------------- | ------ | ------------- | -------- |
| NextHeader    | 20 min | +3-5%         | MEDIUM   |
| EmailWorkflow | 30 min | +4-6%         | MEDIUM   |
| SocialShare   | 10 min | +2-3%         | LOW      |

**Expected Total**: **+9-14% coverage** → **79-97% overall** ✅✅

### Phase 3: Final Polish (Optional, 30 minutes)

**Goal**: +3-5% coverage if needed

- SecureCVDownload (15 min) → +3-4%
- NewsletterWaitlist (10 min) → +2-3%
- Page components (batch) (15 min) → +3-5%

## 📊 REALISTIC PROJECTIONS

| Phase       | Time    | Coverage Gain | Cumulative  | Status            |
| ----------- | ------- | ------------- | ----------- | ----------------- |
| **Current** | 0 min   | -             | **45%**     | 🟡                |
| **Phase 1** | 120 min | +25-38%       | **70-83%**  | ✅ TARGET REACHED |
| **Phase 2** | 60 min  | +9-14%        | **79-97%**  | ✅✅ EXCEEDED     |
| **Phase 3** | 30 min  | +3-5%         | **82-100%** | 🏆 PERFECT        |

**Recommended Stop Point**: After Phase 1 (2 hours) if ≥85% achieved

## 💡 EFFICIENCY PRINCIPLES

### ✅ DO THIS (High ROI)

1. **Target branch coverage gaps** (ChatWidget: 27%, ContactForm: 17%)
2. **Focus on largest files first** (333 lines > 50 lines)
3. **Test user flows, not individual functions**
4. **Use realistic user scenarios**

### ❌ DON'T DO THIS (Low ROI)

1. **Components already >80% coverage** (Modal, Button, Accordion)
2. **Small utility files** (<30 lines)
3. **Perfect 100% on everything** (diminishing returns after 85%)
4. **Testing implementation details** (test behavior, not internals)

## 🎬 START HERE (RIGHT NOW)

**IMMEDIATE ACTION**: ChatWidget comprehensive play functions

```bash
# Open the stories file
code nextjs-app/shared/components/ChatWidget/ChatWidget.stories.tsx

# Target these scenarios for maximum branch coverage:
# 1. Full conversation flow (send message, receive response)
# 2. Error handling (network failures)
# 3. Loading states (thinking indicator)
# 4. Email workflow trigger (user message → assistant response)
# 5. Dynamic component injection (OpenHours, ServicesGrid)
```

**Expected gain**: +10-15% coverage in 45 minutes

---

## Previous Work Completed (For Reference Only)

```typescript
StoryName.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Find interactive elements
  const button = canvas.getByRole("button");
  const input = canvas.getByRole("textbox");

  // Interact
  await userEvent.type(input, "test value");
  await userEvent.click(button);

  // Assert
  await waitFor(() => expect(input).toHaveValue("test value"));
};
```

## Coverage Calculation

To raise coverage from 42% to 85%:

- Need to cover ~43% more of codebase
- With ~80 components, need ~35-40 components with comprehensive `.play` functions
- Current: ~5 components enhanced
- **Remaining**: ~30-35 components need `.play` functions

## Running Coverage

```bash
# Run tests with coverage
npx vitest --project=storybook run --coverage

# View coverage report
open coverage-storybook/index.html
# or visit http://localhost:6010/coverage/index.html when Storybook is running
```

## Known Issues

1. **Browser test instability**: Occasional timeouts/disconnects
   - Solution: Run tests in smaller batches
   - Already added `optimizeDeps.include` to help

2. **Vite dependency reloading**: Can cause false test failures
   - Already mitigated with config changes

## Recommendations

1. **Prioritize by impact**: Focus on low-coverage complex components first
2. **Batch additions**: Add `.play` functions to 5-10 components at a time
3. **Test incrementally**: Run coverage after each batch to track progress
4. **Document patterns**: Create reusable `.play` patterns for common interactions

## Files Modified

- `vitest.config.mts`
- `vitest.setup.ts` (global -> globalThis fixes)
- `nextjs-app/shared/components/Button/SplitButton.stories.tsx`
- `nextjs-app/shared/components/Tabs/Tabs.stories.tsx`
- `nextjs-app/shared/components/Switch/Switch.stories.tsx`
- `nextjs-app/shared/components/CodeSnippet/CodeSnippet.stories.tsx`
- `nextjs-app/shared/components/Modal/Modal.stories.tsx`
- `nextjs-app/shared/components/Button/Button.stories.tsx` (IconOnly fix)
- `nextjs-app/shared/stories/TestHealth.stories.tsx` (metrics fallbacks)
- `scripts/add-play-functions.mjs` (helper script)

## Estimated Effort

- **Time per component**: 10-20 minutes
- **Remaining components**: ~30-35
- **Total estimated time**: 5-10 hours
- **Best approach**: Batch work in 1-hour sessions, 5-7 components per session
