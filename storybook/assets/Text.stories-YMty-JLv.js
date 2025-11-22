import{j as t,u as s}from"./iframe-C1Cq5wbO.js";import{T as r}from"./Text-DST0Crqu.js";import{w as x}from"./index-DwU8chDC.js";import"./preload-helper-D1UD9lgW.js";/* empty css                  */import"./index-DrFu-skq.js";const S={title:"Components/Text",component:r,argTypes:{as:{control:{type:"select"},options:["p","span","div","strong","em"],description:"HTML tag to render"},size:{control:{type:"radio"},options:["S","M","L"],description:"Text size variant"},terminals:{control:{type:"radio"},options:["sans","serif"],description:"Font family (sans or serif)"},className:{control:"text",description:"Custom class name"},children:{control:"text",description:"Text content"}}},T=e=>{const{t:d}=s();return t.jsxDEV(r,{...e,children:d(e.children)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:44,columnNumber:10},void 0)},p=e=>t.jsxDEV(T,{...e},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:46,columnNumber:33},void 0),n=p.bind({});n.args={children:"storyTextPlayground",as:"p",size:"M",terminals:"sans",className:""};n.play=async({canvasElement:e})=>{await x(e).findByText(c=>["Play with the Text component!","Leiki tekstikomponentilla!","Lek med Text-komponenten!"].includes(c))};const o=()=>{const{t:e}=s();return t.jsxDEV(r,{children:e("storyTextDefault")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:68,columnNumber:10},void 0)},a=()=>{const{t:e}=s();return t.jsxDEV(r,{as:"span",children:e("storyTextSpan")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:74,columnNumber:10},void 0)},i=()=>{const{t:e}=s();return t.jsxDEV(r,{className:"custom-class",children:e("storyTextCustom")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:80,columnNumber:10},void 0)},l=()=>{const{t:e}=s();return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(r,{as:"p",children:e("storyTextParagraph")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:87,columnNumber:7},void 0),t.jsxDEV(r,{as:"span",children:e("storyTextSpanTag")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:88,columnNumber:7},void 0),t.jsxDEV(r,{as:"div",children:e("storyTextDiv")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:89,columnNumber:7},void 0),t.jsxDEV(r,{as:"strong",children:e("storyTextStrong")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:90,columnNumber:7},void 0),t.jsxDEV(r,{as:"em",children:e("storyTextEmphasized")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:91,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:86,columnNumber:10},void 0)},m=()=>{const{t:e}=s();return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(r,{size:"S",children:e("storyTextSmall")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:99,columnNumber:7},void 0),t.jsxDEV(r,{size:"M",children:e("storyTextMedium")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:100,columnNumber:7},void 0),t.jsxDEV(r,{size:"L",children:e("storyTextLarge")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:101,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:98,columnNumber:10},void 0)},u=()=>{const{t:e}=s();return t.jsxDEV(t.Fragment,{children:[t.jsxDEV(r,{terminals:"sans",children:e("storyTextSans")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:109,columnNumber:7},void 0),t.jsxDEV(r,{terminals:"serif",children:e("storyTextSerif")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:110,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Text/Text.stories.tsx",lineNumber:108,columnNumber:10},void 0)};o.__docgenInfo={description:"",methods:[],displayName:"Default"};a.__docgenInfo={description:"",methods:[],displayName:"AsSpan"};i.__docgenInfo={description:"",methods:[],displayName:"CustomClass"};l.__docgenInfo={description:"",methods:[],displayName:"AllTags"};m.__docgenInfo={description:"",methods:[],displayName:"Sizes"};u.__docgenInfo={description:"",methods:[],displayName:"SerifAndSans"};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"(args: any) => <TextStory {...args} />",...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <Text>{t("storyTextDefault")}</Text>;
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <Text as="span">{t("storyTextSpan")}</Text>;
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <Text className="custom-class">{t("storyTextCustom")}</Text>;
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <>
      <Text as="p">{t("storyTextParagraph")}</Text>
      <Text as="span">{t("storyTextSpanTag")}</Text>
      <Text as="div">{t("storyTextDiv")}</Text>
      <Text as="strong">{t("storyTextStrong")}</Text>
      <Text as="em">{t("storyTextEmphasized")}</Text>
    </>;
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <>
      <Text size="S">{t("storyTextSmall")}</Text>
      <Text size="M">{t("storyTextMedium")}</Text>
      <Text size="L">{t("storyTextLarge")}</Text>
    </>;
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <>
      <Text terminals="sans">{t("storyTextSans")}</Text>
      <Text terminals="serif">{t("storyTextSerif")}</Text>
    </>;
}`,...u.parameters?.docs?.source}}};const v=["Playground","Default","AsSpan","CustomClass","AllTags","Sizes","SerifAndSans"];export{l as AllTags,a as AsSpan,i as CustomClass,o as Default,n as Playground,u as SerifAndSans,m as Sizes,v as __namedExportsOrder,S as default};
