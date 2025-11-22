import{j as e,a as s,M as i}from"./iframe-C1Cq5wbO.js";import{N as n}from"./NavMenuList-Bz45vgHG.js";import"./preload-helper-D1UD9lgW.js";const d={title:"Patterns/Header/MobileMenu/NavMenuList",component:n,parameters:{wip:{disabled:!1}},decorators:[r=>{const o=()=>s()?e.jsxDEV(r,{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/NavMenuList/NavMenuList.stories.tsx",lineNumber:17,columnNumber:28},void 0):e.jsxDEV(i,{initialEntries:["/work/client"],children:e.jsxDEV(r,{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/NavMenuList/NavMenuList.stories.tsx",lineNumber:19,columnNumber:13},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/NavMenuList/NavMenuList.stories.tsx",lineNumber:18,columnNumber:14},void 0);return e.jsxDEV(o,{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/NavMenuList/NavMenuList.stories.tsx",lineNumber:22,columnNumber:12},void 0)}]},t={name:"Default",render:()=>e.jsxDEV(n,{items:[{to:"/",label:"Home",exact:!0},{to:"/work",label:"Work"},{to:"/about",label:"About"},{to:"/blog",label:"Blog"},{to:"/contact",label:"Contact"}]},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/NavMenuList/NavMenuList.stories.tsx",lineNumber:29,columnNumber:17},void 0)},a={name:"Custom Active Class",render:()=>e.jsxDEV(n,{items:[{to:"/",label:"Home",exact:!0},{to:"/work",label:"Work"},{to:"/about",label:"About"}],activeClassName:"demoActive"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/NavMenuList/NavMenuList.stories.tsx",lineNumber:49,columnNumber:17},void 0),parameters:{docs:{description:{story:"Demonstrates overriding the active class. In production, supply a class that applies brand-specific styling."}}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Default",
  render: () => <NavMenuList items={[{
    to: "/",
    label: "Home",
    exact: true
  }, {
    to: "/work",
    label: "Work"
  }, {
    to: "/about",
    label: "About"
  }, {
    to: "/blog",
    label: "Blog"
  }, {
    to: "/contact",
    label: "Contact"
  }]} />
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "Custom Active Class",
  render: () => <NavMenuList items={[{
    to: "/",
    label: "Home",
    exact: true
  }, {
    to: "/work",
    label: "Work"
  }, {
    to: "/about",
    label: "About"
  }]} activeClassName="demoActive" />,
  parameters: {
    docs: {
      description: {
        story: "Demonstrates overriding the active class. In production, supply a class that applies brand-specific styling."
      }
    }
  }
}`,...a.parameters?.docs?.source}}};const b=["Default","CustomActiveClass"];export{a as CustomActiveClass,t as Default,b as __namedExportsOrder,d as default};
