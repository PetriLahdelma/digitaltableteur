import{r as i,j as t}from"./iframe-C1Cq5wbO.js";import{F as l}from"./FileUpload-BLr4A2uu.js";import"./preload-helper-D1UD9lgW.js";import"./Inputs-D-0oGOPm.js";import"./TextArea-Cs6yRu_G.js";import"./Label-BdMwFsVh.js";const f={title:"Components/FileUpload",component:l},s=o=>{const[a,r]=i.useState(null);return t.jsxDEV("div",{style:{maxWidth:"28rem"},children:t.jsxDEV(l,{...o,value:a,onFileChange:r},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/FileUpload/FileUpload.stories.tsx",lineNumber:13,columnNumber:7},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/FileUpload/FileUpload.stories.tsx",lineNumber:10,columnNumber:10},void 0)},e=s.bind({});e.args={label:"Attachment (optional)",placeholder:"No file selected",helperText:"Optional. Max 5 MB. Accepted formats: PDF, PNG, JPG.",uploadButtonLabel:"Choose file",clearButtonLabel:"Remove file",accept:".pdf,.png,.jpg,.jpeg",maxSizeInBytes:5*1024*1024,sizeErrorMessage:"File exceeds the 5 MB limit."};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`(args: React.ComponentProps<typeof FileUpload>) => {
  const [file, setFile] = useState<File | null>(null);
  return <div style={{
    maxWidth: "28rem"
  }}>
      <FileUpload {...args} value={file} onFileChange={setFile} />
    </div>;
}`,...e.parameters?.docs?.source}}};const F=["Default"];export{e as Default,F as __namedExportsOrder,f as default};
