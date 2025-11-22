import{j as e,I as r,r as g,u as f,B as b}from"./iframe-C1Cq5wbO.js";import{M as p}from"./Modal-BpZJiJg_.js";import"./preload-helper-D1UD9lgW.js";const O={title:"Components/Modal",component:p,argTypes:{title:{control:"text"},variant:{control:{type:"select",options:["default","success","error","loading","info"]}},icon:{control:{type:"select",options:{None:null,Error:e.jsxDEV(r,{name:"x-circle",ariaLabel:"Error"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:25,columnNumber:18},void 0),Success:e.jsxDEV(r,{name:"check-circle",ariaLabel:"Success"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:26,columnNumber:20},void 0),Info:e.jsxDEV(r,{name:"info",ariaLabel:"Info"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:27,columnNumber:17},void 0)}}},children:{control:"text"},onClose:{action:"closed"}}},o=n=>{const[m,u]=g.useState(!0),{t:d}=f();return e.jsxDEV(e.Fragment,{children:[e.jsxDEV(b,{onClick:()=>u(!0),children:d("storyModalOpen")},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:45,columnNumber:7},void 0),e.jsxDEV(p,{...n,isOpen:m,onClose:()=>u(!1),icon:n.icon,title:d(n.title),children:typeof n.children=="string"?d(n.children):n.children},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:46,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:44,columnNumber:10},void 0)},t=o.bind({});t.args={title:"storyModalDefault",variant:"default",icon:null,showCloseIcon:!0};const s=o.bind({});s.args={variant:"loading",title:"storyModalLoading",children:e.jsxDEV("p",{children:"storyModalPleaseWait"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:62,columnNumber:13},void 0),showCloseIcon:!1};const a=o.bind({});a.args={isOpen:!0,title:"storyModalErrorTitle",icon:e.jsxDEV(r,{name:"warning-circle",ariaLabel:"Error",style:{color:"var(--color-error)"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:69,columnNumber:9},void 0),variant:"error",children:"storyModalErrorBody",onClose:()=>alert("Closed")};const l=o.bind({});l.args={isOpen:!0,title:"storyModalSuccessTitle",icon:e.jsxDEV(r,{name:"check-circle",ariaLabel:"Success",style:{color:"var(--color-success)"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:80,columnNumber:9},void 0),variant:"success",children:"storyModalSuccessBody",onClose:()=>alert("Closed")};const i=o.bind({});i.args={isOpen:!0,title:"storyModalInfoTitle",icon:e.jsxDEV(r,{name:"info",ariaLabel:"Info",style:{color:"var(--color-info)"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Modal/Modal.stories.tsx",lineNumber:91,columnNumber:9},void 0),variant:"info",children:"storyModalInfoBody",onClose:()=>alert("Closed")};const c=o.bind({});c.args={variant:"loading",title:"storyModalBusyTitle",children:"storyModalBusyBody",showCloseIcon:!1};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`(args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const {
    t
  } = useTranslation();
  return <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} icon={args.icon} title={t(args.title as string)}
    /* eslint-disable react/no-children-prop */ children={typeof args.children === "string" ? t(args.children) : args.children}
    /* eslint-enable react/no-children-prop */ />
    </>;
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`(args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const {
    t
  } = useTranslation();
  return <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} icon={args.icon} title={t(args.title as string)}
    /* eslint-disable react/no-children-prop */ children={typeof args.children === "string" ? t(args.children) : args.children}
    /* eslint-enable react/no-children-prop */ />
    </>;
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`(args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const {
    t
  } = useTranslation();
  return <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} icon={args.icon} title={t(args.title as string)}
    /* eslint-disable react/no-children-prop */ children={typeof args.children === "string" ? t(args.children) : args.children}
    /* eslint-enable react/no-children-prop */ />
    </>;
}`,...a.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`(args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const {
    t
  } = useTranslation();
  return <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} icon={args.icon} title={t(args.title as string)}
    /* eslint-disable react/no-children-prop */ children={typeof args.children === "string" ? t(args.children) : args.children}
    /* eslint-enable react/no-children-prop */ />
    </>;
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`(args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const {
    t
  } = useTranslation();
  return <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} icon={args.icon} title={t(args.title as string)}
    /* eslint-disable react/no-children-prop */ children={typeof args.children === "string" ? t(args.children) : args.children}
    /* eslint-enable react/no-children-prop */ />
    </>;
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`(args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const {
    t
  } = useTranslation();
  return <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} icon={args.icon} title={t(args.title as string)}
    /* eslint-disable react/no-children-prop */ children={typeof args.children === "string" ? t(args.children) : args.children}
    /* eslint-enable react/no-children-prop */ />
    </>;
}`,...c.parameters?.docs?.source}}};const N=["Default","Loading","ErrorDialog","SuccessDialog","InfoDialog","BusyDialog"];export{c as BusyDialog,t as Default,a as ErrorDialog,i as InfoDialog,s as Loading,l as SuccessDialog,N as __namedExportsOrder,O as default};
