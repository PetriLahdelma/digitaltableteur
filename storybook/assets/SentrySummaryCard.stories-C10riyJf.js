import{j as r}from"./iframe-C1Cq5wbO.js";import{S as e}from"./SentrySummaryCard-AzJSh5L_.js";import"./preload-helper-D1UD9lgW.js";import"./Card-DEFq-zvq.js";import"./Title-CGgMfyJb.js";/* empty css                  */import"./Text-DST0Crqu.js";import"./Link-BQ1ExbuI.js";const f={title:"Observability/SentrySummaryCard",component:e,parameters:{wip:{disabled:!1}}},i={generatedAt:new Date().toISOString(),project:"frontend",filters:{unresolved:!0,environment:"production"},count:1,issues:[{id:"1",title:"TypeError: Cannot read property 'foo' of undefined",culprit:"App.tsx",level:"error",userCount:3,status:"unresolved",isUnhandled:!0,firstSeen:new Date().toISOString(),lastSeen:new Date().toISOString(),permalink:"https://sentry.io/issue/1",environment:"production"}]},t={render:()=>r.jsxDEV(e,{forceLoading:!0},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/SentrySummaryCard/SentrySummaryCard.stories.tsx",lineNumber:38,columnNumber:17},void 0),parameters:{docs:{description:{story:"Displays loading state while fetching summary JSON."}}}},n={render:()=>r.jsxDEV(e,{dataOverride:i},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/SentrySummaryCard/SentrySummaryCard.stories.tsx",lineNumber:48,columnNumber:17},void 0),parameters:{docs:{description:{story:"Renders issues from pre-generated JSON (ensure file exists)."}}}},s={render:()=>r.jsxDEV(e,{dataOverride:{generatedAt:new Date().toISOString(),project:"frontend",filters:{unresolved:!1,environment:null},count:0,issues:[]}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/SentrySummaryCard/SentrySummaryCard.stories.tsx",lineNumber:58,columnNumber:17},void 0),parameters:{docs:{description:{story:"Shows empty message when no issues match filters."}}}},a={render:()=>r.jsxDEV(e,{forceError:!0},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/SentrySummaryCard/SentrySummaryCard.stories.tsx",lineNumber:77,columnNumber:17},void 0),parameters:{docs:{description:{story:"Displays localized error when fetch fails."}}}},o={render:()=>r.jsxDEV(e,{dataOverride:{generatedAt:new Date().toISOString(),project:"frontend",filters:{unresolved:!0,environment:null},count:0,issues:[],stub:!0,reason:"storybook-demo"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/SentrySummaryCard/SentrySummaryCard.stories.tsx",lineNumber:87,columnNumber:17},void 0),parameters:{docs:{description:{story:"Indicates fallback stub summary (e.g., missing credentials) via badge."}}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <SentrySummaryCard forceLoading />,
  parameters: {
    docs: {
      description: {
        story: "Displays loading state while fetching summary JSON."
      }
    }
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <SentrySummaryCard dataOverride={mockIssue} />,
  parameters: {
    docs: {
      description: {
        story: "Renders issues from pre-generated JSON (ensure file exists)."
      }
    }
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <SentrySummaryCard dataOverride={{
    generatedAt: new Date().toISOString(),
    project: "frontend",
    filters: {
      unresolved: false,
      environment: null
    },
    count: 0,
    issues: []
  }} />,
  parameters: {
    docs: {
      description: {
        story: "Shows empty message when no issues match filters."
      }
    }
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <SentrySummaryCard forceError />,
  parameters: {
    docs: {
      description: {
        story: "Displays localized error when fetch fails."
      }
    }
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <SentrySummaryCard dataOverride={{
    generatedAt: new Date().toISOString(),
    project: "frontend",
    filters: {
      unresolved: true,
      environment: null
    },
    count: 0,
    issues: [],
    stub: true,
    reason: "storybook-demo"
  }} />,
  parameters: {
    docs: {
      description: {
        story: "Indicates fallback stub summary (e.g., missing credentials) via badge."
      }
    }
  }
}`,...o.parameters?.docs?.source}}};const g=["Loading","WithData","Empty","ErrorState","Stub"];export{s as Empty,a as ErrorState,t as Loading,o as Stub,n as WithData,g as __namedExportsOrder,f as default};
