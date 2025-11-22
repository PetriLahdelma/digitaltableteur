import{n as O,j as i,R as v,I as b}from"./iframe-C1Cq5wbO.js";import{A as R}from"./Avatar-B_AZYOPA.js";import{p as I}from"./pete-vault-boy-DjgBPqUr.js";import{w as N,u as V}from"./index-DwU8chDC.js";import"./preload-helper-D1UD9lgW.js";import"./index-DrFu-skq.js";var x={exports:{}},S,L;function D(){if(L)return S;L=1;var t="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";return S=t,S}var E,M;function C(){if(M)return E;M=1;var t=D();function r(){}function m(){}return m.resetWarningCache=r,E=function(){function e(P,_,n,z,A,w){if(w!==t){var u=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw u.name="Invariant Violation",u}}e.isRequired=e;function a(){return e}var d={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:a,element:e,elementType:e,instanceOf:a,node:e,objectOf:a,oneOf:a,oneOfType:a,shape:a,exact:a,checkPropTypes:m,resetWarningCache:r};return d.PropTypes=d,d},E}var W;function j(){return W||(W=1,x.exports=C()()),x.exports}var B=j();const K=O(B),U={title:"Components/Avatar",component:R,argTypes:{variant:{control:{type:"inline-radio"},options:["image","initials"],description:"Select whether the avatar prefers an image or initials."},name:{control:{type:"text"},description:"Full name used for fallback initials (e.g., 'First Last' -> 'FL')."}}},y=t=>i.jsxDEV(R,{...t},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:32,columnNumber:52},void 0),k=({previewPlacement:t="right",...r})=>{const d=v.useRef(null),[P,_]=v.useState(0),[n,z]=v.useState({width:0,height:0});v.useEffect(()=>{_(h=>h+1)},[t]),v.useLayoutEffect(()=>{if(typeof window>"u")return;const h=d.current?.parentElement;if(!h)return;const g=()=>{const f=h.getBoundingClientRect();z({width:f.width,height:f.height})};if(g(),typeof ResizeObserver<"u"){const f=new ResizeObserver(()=>g());return f.observe(h),()=>f.disconnect()}return window.addEventListener("resize",g),()=>window.removeEventListener("resize",g)},[]);const A=t==="left"?"flex-start":t==="right"?"flex-end":"center",w=t==="top"?"flex-start":t==="bottom"?"flex-end":"center",u=n.width>0?Math.max(n.width-48,220):void 0,T=n.height>0?Math.max(n.height-48,220):void 0;return i.jsxDEV("div",{ref:d,style:{display:"flex",width:n.width>0?`${n.width}px`:"100%",blockSize:n.height>0?`${n.height}px`:"100%",minBlockSize:"95vh",padding:"24px",boxSizing:"border-box"},children:i.jsxDEV("div",{style:{display:"flex",justifyContent:A,alignItems:w,minHeight:"220px",padding:"1.5rem",inlineSize:u?`${u}px`:"100%",blockSize:T?`${T}px`:void 0,border:"1px dashed var(--color-border, #c0c0c0)",boxSizing:"border-box",width:"100%"},children:i.jsxDEV(R,{...r,placementRefreshKey:P},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:95,columnNumber:9},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:81,columnNumber:7},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:73,columnNumber:10},void 0)};k.propTypes={previewPlacement:K.oneOf(["left","right","top","bottom"])};const c=y.bind({});c.args={imageUrl:I,name:"Petri Lahdelma",variant:"image"};c.parameters={docs:{description:{story:"Default avatar that can switch between image/initials via controls."}}};const l=y.bind({});l.args={imageUrl:I,name:void 0,variant:"image"};const p=y.bind({});p.args={name:"Petri Lahdelma",variant:"initials"};const o=y.bind({});o.args={imageUrl:I,name:"Petri Lahdelma",menuLabel:"Open avatar menu",variant:"image",menuItems:[{label:"Profile",icon:i.jsxDEV(b,{name:"user","aria-hidden":"true"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:135,columnNumber:11},void 0)},{label:"Settings",icon:i.jsxDEV(b,{name:"gear","aria-hidden":"true"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:138,columnNumber:11},void 0)},{label:"Help",icon:i.jsxDEV(b,{name:"question-mark","aria-hidden":"true"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:141,columnNumber:11},void 0)},{label:"Sign out",icon:i.jsxDEV(b,{name:"sign-out","aria-hidden":"true"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Avatar/Avatar.stories.tsx",lineNumber:144,columnNumber:11},void 0)}]};const s=k.bind({});s.args={...o.args,previewPlacement:"right"};s.argTypes={previewPlacement:{options:["left","right","top","bottom"],control:{type:"inline-radio"},description:"Moves the avatar closer to an edge to verify automatic menu alignment."}};s.parameters={docs:{description:{story:"Place the avatar near each edge to confirm the dropdown flips when space is limited."}}};l.play=async({canvasElement:t})=>{await N(t).findByRole("img")};p.play=async({canvasElement:t})=>{await N(t).findByText("PL")};o.play=async({canvasElement:t})=>{const r=N(t),m=V.setup(),e=r.getByRole("button",{name:/avatar menu/i});await m.click(e),await r.findByRole("menuitem",{name:"Profile"})};s.play=o.play;c.play=l.play;c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"args => <Avatar {...args} />",...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"args => <Avatar {...args} />",...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:"args => <Avatar {...args} />",...p.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"args => <Avatar {...args} />",...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`({
  previewPlacement = "right",
  ...avatarArgs
}) => {
  const PREVIEW_MARGIN = 24;
  const MIN_BLOCK_SIZE = 220;
  const MIN_INLINE_SIZE = 220;
  const areaRef = React.useRef<HTMLDivElement | null>(null);
  const [placementRefreshKey, setPlacementRefreshKey] = React.useState(0);
  const [previewSize, setPreviewSize] = React.useState({
    width: 0,
    height: 0
  });
  React.useEffect(() => {
    setPlacementRefreshKey(prev => prev + 1);
  }, [previewPlacement]);
  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const parent = areaRef.current?.parentElement;
    if (!parent) return;
    const updateSize = () => {
      const rect = parent.getBoundingClientRect();
      setPreviewSize({
        width: rect.width,
        height: rect.height
      });
    };
    updateSize();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(parent);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const justifyContent = previewPlacement === "left" ? "flex-start" : previewPlacement === "right" ? "flex-end" : "center";
  const alignItems = previewPlacement === "top" ? "flex-start" : previewPlacement === "bottom" ? "flex-end" : "center";
  const computedWidth = previewSize.width > 0 ? Math.max(previewSize.width - PREVIEW_MARGIN * 2, MIN_INLINE_SIZE) : undefined;
  const computedHeight = previewSize.height > 0 ? Math.max(previewSize.height - PREVIEW_MARGIN * 2, MIN_BLOCK_SIZE) : undefined;
  return <div ref={areaRef} style={{
    display: "flex",
    width: previewSize.width > 0 ? \`\${previewSize.width}px\` : "100%",
    blockSize: previewSize.height > 0 ? \`\${previewSize.height}px\` : "100%",
    minBlockSize: "95vh",
    padding: \`\${PREVIEW_MARGIN}px\`,
    boxSizing: "border-box"
  }}>
      <div style={{
      display: "flex",
      /* stylelint-disable-next-line value-keyword-case */
      justifyContent,
      /* stylelint-disable-next-line value-keyword-case */
      alignItems,
      minHeight: \`\${MIN_BLOCK_SIZE}px\`,
      padding: "1.5rem",
      inlineSize: computedWidth ? \`\${computedWidth}px\` : "100%",
      blockSize: computedHeight ? \`\${computedHeight}px\` : undefined,
      border: "1px dashed var(--color-border, #c0c0c0)",
      boxSizing: "border-box",
      width: "100%"
    }}>
        <Avatar {...avatarArgs} placementRefreshKey={placementRefreshKey} />
      </div>
    </div>;
}`,...s.parameters?.docs?.source}}};const Y=["DefaultVariant","WithImage","WithInitials","WithMenu","EdgeDetection"];export{c as DefaultVariant,s as EdgeDetection,l as WithImage,p as WithInitials,o as WithMenu,Y as __namedExportsOrder,U as default};
