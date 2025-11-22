import{j as t,u as p,r as S}from"./iframe-C1Cq5wbO.js";import{S as c,a as i}from"./Select-Cyax4U6h.js";import{w as d,u}from"./index-DwU8chDC.js";import"./preload-helper-D1UD9lgW.js";import"./Label-BdMwFsVh.js";import"./index-DrFu-skq.js";const N={title:"Components/Select",component:c,argTypes:{label:{control:"text"},options:{control:"object"},value:{control:"text"},disabled:{control:"boolean"}}},x=e=>{const{t:o}=p(),a=e.options?.map(b=>({...b,label:o(b.label)}));return t.jsxDEV("div",{style:{maxWidth:"var(--size-width-md)"},children:t.jsxDEV(c,{...e,label:o(e.label),options:a},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:36,columnNumber:7},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:33,columnNumber:10},void 0)},m=e=>t.jsxDEV(x,{...e},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:39,columnNumber:89},void 0),l=m.bind({});l.args={label:"storySelectLabel",options:[{value:"option1",label:"storyCheckboxOption1"},{value:"option2",label:"storyCheckboxOption2"},{value:"option3",label:"storyCheckboxOption3"}],value:"option1"};const n=m.bind({});n.args={label:"storySelectDisabledLabel",options:[{value:"option1",label:"storyCheckboxOption1"},{value:"option2",label:"storyCheckboxOption2"},{value:"option3",label:"storyCheckboxOption3"}],value:"option1",disabled:!0};const r=()=>{const{t:e}=p();return t.jsxDEV(c,{label:e("storySelectLabel"),defaultValue:"",children:[t.jsxDEV(i,{value:"",label:"Select...",disabled:!0},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:76,columnNumber:7},void 0),t.jsxDEV(i,{value:"option1",label:e("storyCheckboxOption1")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:77,columnNumber:7},void 0),t.jsxDEV(i,{value:"option2",label:e("storyCheckboxOption2")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:78,columnNumber:7},void 0),t.jsxDEV(i,{value:"option3",label:e("storyCheckboxOption3")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:79,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:75,columnNumber:10},void 0)},s=()=>{const{t:e}=p(),[o,a]=S.useState("option1");return t.jsxDEV(c,{label:e("storySelectLabel"),value:o,onValueChange:a,options:[{value:"option1",label:e("storyCheckboxOption1")},{value:"option2",label:e("storyCheckboxOption2")},{value:"option3",label:e("storyCheckboxOption3")}]},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Select/Select.stories.tsx",lineNumber:87,columnNumber:10},void 0)};l.play=async({canvasElement:e})=>{const a=await d(e).findByLabelText(/select an option/i);await u.selectOptions(a,"option2"),await u.tab()};n.play=async({canvasElement:e})=>{await d(e).findByLabelText(/disabled select/i),await u.tab()};r.__docgenInfo={description:"",methods:[],displayName:"WithCustomChildren"};s.__docgenInfo={description:"",methods:[],displayName:"Controlled"};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"(args: React.ComponentProps<typeof Select>) => <SelectStory {...args} />",...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"(args: React.ComponentProps<typeof Select>) => <SelectStory {...args} />",...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  return <Select label={t("storySelectLabel")} defaultValue="">
      <SelectOption value="" label="Select..." disabled />
      <SelectOption value="option1" label={t("storyCheckboxOption1")} />
      <SelectOption value="option2" label={t("storyCheckboxOption2")} />
      <SelectOption value="option3" label={t("storyCheckboxOption3")} />
    </Select>;
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`() => {
  const {
    t
  } = useTranslation();
  const [current, setCurrent] = useState("option1");
  return <Select label={t("storySelectLabel")} value={current} onValueChange={setCurrent} options={[{
    value: "option1",
    label: t("storyCheckboxOption1")
  }, {
    value: "option2",
    label: t("storyCheckboxOption2")
  }, {
    value: "option3",
    label: t("storyCheckboxOption3")
  }]} />;
}`,...s.parameters?.docs?.source}}};const k=["Default","Disabled","WithCustomChildren","Controlled"];export{s as Controlled,l as Default,n as Disabled,r as WithCustomChildren,k as __namedExportsOrder,N as default};
