import{u as a,j as t}from"./iframe-C1Cq5wbO.js";import{T as l}from"./Title-CGgMfyJb.js";import{w as d}from"./index-DwU8chDC.js";import"./preload-helper-D1UD9lgW.js";/* empty css                  */import"./index-DrFu-skq.js";const b={title:"Components/Title",component:l},i=()=>{const{t:e}=a();return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(l,{size:"S",children:e("storyTitleSmall")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:14,columnNumber:7},void 0),t.jsxDEV(l,{size:"M",children:e("storyTitleMedium")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:15,columnNumber:7},void 0),t.jsxDEV(l,{size:"L",children:e("storyTitleLarge")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:16,columnNumber:7},void 0),t.jsxDEV(l,{size:"XL",children:e("storyTitleXL")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:17,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:13,columnNumber:10},void 0)},r=()=>{const{t:e}=a();return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(l,{level:1,children:e("storyHeading1")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:25,columnNumber:7},void 0),t.jsxDEV(l,{level:2,children:e("storyHeading2")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:26,columnNumber:7},void 0),t.jsxDEV(l,{level:3,children:e("storyHeading3")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:27,columnNumber:7},void 0),t.jsxDEV(l,{level:4,children:e("storyHeading4")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:28,columnNumber:7},void 0),t.jsxDEV(l,{level:5,children:e("storyHeading5")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:29,columnNumber:7},void 0),t.jsxDEV(l,{level:6,children:e("storyHeading6")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:30,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:24,columnNumber:10},void 0)},s=()=>{const{t:e}=a();return t.jsxDEV(l,{as:"div",className:"custom-class",size:"M",children:e("storyTitleCustom")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:37,columnNumber:10},void 0)},n=e=>{const{t:o}=a();return t.jsxDEV(l,{...e,children:o(e.children)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Title/Title.stories.tsx",lineNumber:45,columnNumber:10},void 0)};n.args={level:2,size:"M",children:"storyTitlePlayground"};n.argTypes={level:{control:{type:"select"},options:[1,2,3,4,5,6],defaultValue:2},size:{control:{type:"select"},options:["XS","S","M","L","XL"],defaultValue:"M"},children:{control:"text",defaultValue:"Playground Title"},className:{control:"text"},terminals:{control:{type:"select"},options:["serif","sans"],defaultValue:"serif"},as:{control:"text"}};i.play=async({canvasElement:e})=>{if((await d(e).findAllByRole("heading")).length<4)throw new Error("Expected four title sizes to be rendered")};r.play=async({canvasElement:e})=>{if((await d(e).findAllByRole("heading")).length<6)throw new Error("Expected six heading levels to be rendered")};i.__docgenInfo={description:"",methods:[{name:"play",docblock:null,modifiers:["static"],params:[{name:"{ canvasElement }: { canvasElement: HTMLElement }",optional:!1,type:{name:"signature",type:"object",raw:"{ canvasElement: HTMLElement }",signature:{properties:[{key:"canvasElement",value:{name:"HTMLElement",required:!0}}]}}}],returns:null}],displayName:"AllSizes"};r.__docgenInfo={description:"",methods:[{name:"play",docblock:null,modifiers:["static"],params:[{name:"{ canvasElement }: { canvasElement: HTMLElement }",optional:!1,type:{name:"signature",type:"object",raw:"{ canvasElement: HTMLElement }",signature:{properties:[{key:"canvasElement",value:{name:"HTMLElement",required:!0}}]}}}],returns:null}],displayName:"AllLevels"};s.__docgenInfo={description:"",methods:[],displayName:"CustomTagAndClass"};n.__docgenInfo={description:"",methods:[],displayName:"Playground"};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <>
      <Title size="S">{t("storyTitleSmall")}</Title>
      <Title size="M">{t("storyTitleMedium")}</Title>
      <Title size="L">{t("storyTitleLarge")}</Title>
      <Title size="XL">{t("storyTitleXL")}</Title>
    </>;
}`,...i.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <>
      <Title level={1}>{t("storyHeading1")}</Title>
      <Title level={2}>{t("storyHeading2")}</Title>
      <Title level={3}>{t("storyHeading3")}</Title>
      <Title level={4}>{t("storyHeading4")}</Title>
      <Title level={5}>{t("storyHeading5")}</Title>
      <Title level={6}>{t("storyHeading6")}</Title>
    </>;
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <Title as="div" className="custom-class" size="M">
      {t("storyTitleCustom")}
    </Title>;
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`(args: any) => {
  const {
    t
  } = useTranslation();
  return <Title {...args}>{t(args.children)}</Title>;
}`,...n.parameters?.docs?.source}}};const y=["AllSizes","AllLevels","CustomTagAndClass","Playground"];export{r as AllLevels,i as AllSizes,s as CustomTagAndClass,n as Playground,y as __namedExportsOrder,b as default};
