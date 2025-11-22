import{j as h}from"./iframe-C1Cq5wbO.js";import{F as w}from"./FlexBox-C0zqdlRH.js";import"./preload-helper-D1UD9lgW.js";const W={title:"Components/FlexBox",component:w,argTypes:{direction:{control:"select",options:["row","row-reverse","column","column-reverse"]},wrap:{control:"select",options:["nowrap","wrap","wrap-reverse"]},justify:{control:"select",options:["flex-start","flex-end","center","space-between","space-around","space-evenly"]},align:{control:"select",options:["stretch","flex-start","flex-end","center","baseline"]},gap:{control:"text"},rowGap:{control:"text"},columnGap:{control:"text"}}},r={blue:"#0b3d91",cyan:"#0f766e",pink:"#9d174d",purple:"#5b21b6",neutral:"#f1f5f9"},n="#f9fafb",k="#1f2933",l=[{background:r.blue,color:n},{background:r.cyan,color:n},{background:r.pink,color:n},{background:r.purple,color:n},{background:r.neutral,color:k}],f=i=>l[i%l.length],e=(i,m,d,p={})=>{const{background:u,color:g}=f(d);return h.jsxDEV("div",{style:{background:u,color:g,padding:16,...p},children:m},i,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/FlexBox/FlexBox.stories.tsx",lineNumber:69,columnNumber:10},void 0)},t={args:{direction:"row",gap:"1rem",children:[e("1","Item 1",0),e("2","Item 2",1),e("3","Item 3",2)]}},o={args:{direction:"column",gap:"1rem",children:[e("1","Column 1",0),e("2","Column 2",1),e("3","Column 3",2)]}},a={args:{direction:"row",justify:"space-between",align:"center",gap:"1rem",style:{minHeight:120},children:[e("1","Left",0),e("2","Center",1),e("3","Right",2)]}},c={args:{direction:"row",wrap:"wrap",gap:"1rem",style:{width:300},children:[e("1","A",0,{minWidth:120}),e("2","B",1,{minWidth:120}),e("3","C",2,{minWidth:120}),e("4","D",3,{minWidth:120})]}},s={args:{direction:"row",gap:"2rem",rowGap:"1rem",columnGap:"2rem",wrap:"wrap",style:{width:400},children:[e("1","1",0,{minWidth:120}),e("2","2",1,{minWidth:120}),e("3","3",2,{minWidth:120}),e("4","4",3,{minWidth:120})]}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    direction: "row",
    gap: "1rem",
    children: [createBlock("1", "Item 1", 0), createBlock("2", "Item 2", 1), createBlock("3", "Item 3", 2)]
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    direction: "column",
    gap: "1rem",
    children: [createBlock("1", "Column 1", 0), createBlock("2", "Column 2", 1), createBlock("3", "Column 3", 2)]
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    direction: "row",
    justify: "space-between",
    align: "center",
    gap: "1rem",
    style: {
      minHeight: 120
    },
    children: [createBlock("1", "Left", 0), createBlock("2", "Center", 1), createBlock("3", "Right", 2)]
  }
}`,...a.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    direction: "row",
    wrap: "wrap",
    gap: "1rem",
    style: {
      width: 300
    },
    children: [createBlock("1", "A", 0, {
      minWidth: 120
    }), createBlock("2", "B", 1, {
      minWidth: 120
    }), createBlock("3", "C", 2, {
      minWidth: 120
    }), createBlock("4", "D", 3, {
      minWidth: 120
    })]
  }
}`,...c.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    direction: "row",
    gap: "2rem",
    rowGap: "1rem",
    columnGap: "2rem",
    wrap: "wrap",
    style: {
      width: 400
    },
    children: [createBlock("1", "1", 0, {
      minWidth: 120
    }), createBlock("2", "2", 1, {
      minWidth: 120
    }), createBlock("3", "3", 2, {
      minWidth: 120
    }), createBlock("4", "4", 3, {
      minWidth: 120
    })]
  }
}`,...s.parameters?.docs?.source}}};const y=["Basic","Column","JustifyAlign","Wrap","GapVariants"];export{t as Basic,o as Column,s as GapVariants,a as JustifyAlign,c as Wrap,y as __namedExportsOrder,W as default};
