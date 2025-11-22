import{R as f,j as r}from"./iframe-C1Cq5wbO.js";import{c as l,e as g}from"./reducer-BWBL8g6J.js";import"./preload-helper-D1UD9lgW.js";const w=({state:m})=>{const[e,d]=f.useState(m),c=u=>{d(p=>g(p,u))};return r.jsxDEV("div",{style:{maxWidth:420},children:r.jsxDEV("div",{"data-story-state":e.step,children:[e.step==="promptStart"&&r.jsxDEV("div",{children:"Prompt: compose or cancel"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:22,columnNumber:44},void 0),e.step.startsWith("collecting")&&"draft"in e&&r.jsxDEV("div",{children:["Collecting field: ",e.step.replace("collecting","")]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:23,columnNumber:73},void 0),e.step==="review"&&"draft"in e&&r.jsxDEV("div",{children:"Review summary"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:24,columnNumber:61},void 0),e.step==="sending"&&r.jsxDEV("div",{children:"Sending…"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:25,columnNumber:40},void 0),e.step==="success"&&r.jsxDEV("div",{children:"Success!"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:26,columnNumber:40},void 0),e.step==="error"&&r.jsxDEV("div",{children:["Error: ",e.errorCode||"unknown"]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:27,columnNumber:38},void 0),r.jsxDEV("button",{onClick:()=>c({type:"CANCEL"}),children:"Reset"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:28,columnNumber:9},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:21,columnNumber:7},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/ChatWidget/emailWorkflow/EmailWorkflow.stories.tsx",lineNumber:18,columnNumber:10},void 0)},N={title:"Components/AI/Chat/Custom Components/EmailWorkflow",component:w,parameters:{wip:{disabled:!1}}},t={args:{state:{step:"promptStart"}}},a={args:{state:{step:"collectingFullName",draft:l()}}},s={args:{state:{step:"review",draft:l()}}},o={args:{state:{step:"sending",draft:l()}}},i={args:{state:{step:"success"}}},n={args:{state:{step:"error",draft:l(),errorCode:"sendFailed"}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      step: "promptStart"
    }
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      step: "collectingFullName",
      draft: createInitialDraft()
    }
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      step: "review",
      draft: createInitialDraft()
    }
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      step: "sending",
      draft: createInitialDraft()
    }
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      step: "success"
    }
  }
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      step: "error",
      draft: createInitialDraft(),
      errorCode: "sendFailed"
    }
  }
}`,...n.parameters?.docs?.source}}};const h=["Prompt","CollectingFullName","Review","Sending","Success","ErrorState"];export{a as CollectingFullName,n as ErrorState,t as Prompt,s as Review,o as Sending,i as Success,h as __namedExportsOrder,N as default};
