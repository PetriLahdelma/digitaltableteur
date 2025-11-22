import{j as a,R as i}from"./iframe-C1Cq5wbO.js";import{S as d}from"./Switch-BYgdyIlM.js";import"./preload-helper-D1UD9lgW.js";import"./Label-BdMwFsVh.js";const f={title:"Components/Switch",component:d,argTypes:{checked:{control:"boolean"},loading:{control:"boolean"},disabled:{control:"boolean"},label:{control:"text"},labelPlacement:{control:{type:"select"},options:["right","left","top"]}},args:{checked:!1,loading:!1,disabled:!1,label:"Enable notifications",labelPlacement:"right"}},o=e=>{const[m,s]=i.useState(e.checked??!1);return i.useEffect(()=>{s(e.checked??!1)},[e.checked]),a.jsxDEV(d,{...e,checked:m,onCheckedChange:c=>{s(c),e.onCheckedChange?.(c)}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Switch/Switch.stories.tsx",lineNumber:42,columnNumber:10},void 0)},t={name:"Default",render:e=>a.jsxDEV(o,{...e},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Switch/Switch.stories.tsx",lineNumber:49,columnNumber:19},void 0)},r={name:"Loading",args:{loading:!0,checked:!0},render:e=>a.jsxDEV(o,{...e},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Switch/Switch.stories.tsx",lineNumber:57,columnNumber:19},void 0)},n={name:"Label on Top",args:{labelPlacement:"top",label:"Top aligned label"},render:e=>a.jsxDEV(o,{...e},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Switch/Switch.stories.tsx",lineNumber:65,columnNumber:19},void 0)},l={name:"Label on Left (Full Width)",args:{labelPlacement:"left",label:"Make this project public"},render:e=>a.jsxDEV(o,{...e},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Switch/Switch.stories.tsx",lineNumber:73,columnNumber:19},void 0)};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Default",
  render: args => <ControlledTemplate {...args} />
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "Loading",
  args: {
    loading: true,
    checked: true
  },
  render: args => <ControlledTemplate {...args} />
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Label on Top",
  args: {
    labelPlacement: "top",
    label: "Top aligned label"
  },
  render: args => <ControlledTemplate {...args} />
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Label on Left (Full Width)",
  args: {
    labelPlacement: "left",
    label: "Make this project public"
  },
  render: args => <ControlledTemplate {...args} />
}`,...l.parameters?.docs?.source}}};const h=["Default","Loading","LabelOnTop","LabelOnLeft"];export{t as Default,l as LabelOnLeft,n as LabelOnTop,r as Loading,h as __namedExportsOrder,f as default};
