import{j as c,r as m}from"./iframe-C1Cq5wbO.js";import{B as d}from"./BusyIndicator-B7J75xOs.js";import"./preload-helper-D1UD9lgW.js";const b={title:"Feedback/BusyIndicator",component:d,parameters:{wip:{disabled:!1}}},e={args:{size:"m"}},r={args:{size:"s"}},s={args:{size:"l"}},a={args:{size:"m",variant:"overlay"}},p=()=>{const[n,l]=m.useState(0);return m.useEffect(()=>{const u=setInterval(()=>l(i=>i>=1?1:i+.1),300);return()=>clearInterval(u)},[]),c.jsxDEV(d,{progress:n,label:`Loading ${Math.round(n*100)}%`,size:"m"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/BusyIndicator/BusyIndicator.stories.tsx",lineNumber:42,columnNumber:10},void 0)},t={render:()=>c.jsxDEV(p,{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/BusyIndicator/BusyIndicator.stories.tsx",lineNumber:45,columnNumber:17},void 0)},o={args:{progress:1,size:"m"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    size: "m"
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    size: "s"
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    size: "l"
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    size: "m",
    variant: "overlay"
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <DeterminateDemo />
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 1,
    size: "m"
  }
}`,...o.parameters?.docs?.source}}};const z=["Indeterminate","SmallInline","Large","Overlay","Determinate","Completed"];export{o as Completed,t as Determinate,e as Indeterminate,s as Large,a as Overlay,r as SmallInline,z as __namedExportsOrder,b as default};
