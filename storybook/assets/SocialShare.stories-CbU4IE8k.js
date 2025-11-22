import{S as o}from"./SocialShare-eYnDTArT.js";import"./iframe-C1Cq5wbO.js";import"./preload-helper-D1UD9lgW.js";const n={title:"Components/SocialShare",component:o,parameters:{layout:"centered",wip:{disabled:!1}},tags:["autodocs"],argTypes:{url:{control:"text",description:"The URL to share"},title:{control:"text",description:"The title to share"}}},e={args:{url:"https://digitaltableteur.com",title:"Digital Tableteur - Portfolio"}},t={args:{url:"https://digitaltableteur.com/blog/workflow-tips",title:"Workflow Tips for Developers"}},r={args:{url:"https://digitaltableteur.com",title:"Mobile Social Share Test"},parameters:{viewport:{defaultViewport:"mobile1"}}},a={args:{url:"https://digitaltableteur.com",title:"Native Share API Test"},parameters:{docs:{description:{story:"This story simulates native share support. On devices that support the Web Share API (iOS Safari, Android Chrome), this will show a native share button instead of copy to clipboard."}}},beforeEach:()=>{Object.defineProperty(navigator,"share",{writable:!0,value:()=>Promise.resolve()})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    url: "https://digitaltableteur.com",
    title: "Digital Tableteur - Portfolio"
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    url: "https://digitaltableteur.com/blog/workflow-tips",
    title: "Workflow Tips for Developers"
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    url: "https://digitaltableteur.com",
    title: "Mobile Social Share Test"
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    }
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    url: "https://digitaltableteur.com",
    title: "Native Share API Test"
  },
  parameters: {
    docs: {
      description: {
        story: "This story simulates native share support. On devices that support the Web Share API (iOS Safari, Android Chrome), this will show a native share button instead of copy to clipboard."
      }
    }
  },
  beforeEach: () => {
    // Mock native share support for this story
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: () => Promise.resolve()
    });
  }
}`,...a.parameters?.docs?.source}}};const p=["Default","BlogPost","MobileView","WithNativeShare"];export{t as BlogPost,e as Default,r as MobileView,a as WithNativeShare,p as __namedExportsOrder,n as default};
