import{j as e,I as t,R as q}from"./iframe-C1Cq5wbO.js";import{C as V}from"./Card-DEFq-zvq.js";import"./preload-helper-D1UD9lgW.js";import"./Title-CGgMfyJb.js";/* empty css                  */import"./Text-DST0Crqu.js";import"./Link-BQ1ExbuI.js";const U={title:"DesignSystem/Card",component:V,parameters:{wip:{disabled:!1}},argTypes:{size:{control:{type:"select"},options:["S","M","L","full"],description:"Card size with max-width constraints: S(320px), M(480px), L(600px), full(100%)"},variant:{control:{type:"select"},options:["outlined","filled","elevated"],description:"Card visual variant"},badge:{control:{type:"text"},description:"Badge content (text/number) or custom React element"},"badgeProps.state":{control:{type:"select"},options:["success","info","error","warning","neutral"],description:"Badge semantic state"},"badgeProps.position":{control:{type:"select"},options:["start","end"],description:"Badge position in header"},statusMessage:{control:{type:"text"},description:"Status/error message below header"},"statusMessageProps.state":{control:{type:"select"},options:["success","info","error","warning"],description:"Status message state"},"iconProps.position":{control:{type:"select"},options:["start","end","top"],description:"Icon position relative to title"},"iconProps.size":{control:{type:"select"},options:["sm","md","lg"],description:"Icon size variant"},hoverable:{control:{type:"boolean"},description:"Enable hover elevation effect"},loading:{control:{type:"boolean"},description:"Show loading skeleton state"}}},a={args:{title:"Card Playground",subTitle:"Interactive testing",body:"Use the controls panel to explore different Card configurations and features.",icon:e.jsxDEV(t,{name:"palette",ariaLabel:"palette"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:95,columnNumber:11},void 0),iconProps:{position:"start",size:"md"},badge:"Demo",badgeProps:{state:"info",position:"end"},variant:"outlined",size:"M",hoverable:!0}},r={args:{title:"Default Card",body:"Simple card with basic content and default styling."}},n={args:{title:"Hoverable Card",body:"This card responds to hover with subtle elevation and background changes.",hoverable:!0}},i={args:{title:"Loading Card",loading:!0,body:"Content hidden during loading state"}},o={args:{title:"Creative Development",icon:e.jsxDEV(t,{name:"palette",ariaLabel:"palette"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:135,columnNumber:11},void 0),iconProps:{position:"start",size:"md"},body:"Digital experiences that combine aesthetic excellence with functional innovation.",variant:"elevated",hoverable:!0}},s={args:{title:"External Link",icon:e.jsxDEV(t,{name:"arrow-square-out",ariaLabel:"arrow-square-out"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:148,columnNumber:11},void 0),iconProps:{position:"end",size:"sm"},body:"Card with trailing icon to indicate external navigation.",variant:"outlined"}},l={args:{title:"Strategy & Analytics",icon:e.jsxDEV(t,{name:"chart-line-up",ariaLabel:"chart-line-up"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:160,columnNumber:11},void 0),iconProps:{position:"top",size:"lg"},body:"Strategic thinking meets data visualization to create meaningful insights.",variant:"filled"}},c={args:{title:"Custom Typography",titleProps:{size:"L"},subTitle:"Subtitle with custom styling",subTitleProps:{size:"M"},body:"Body text with customized appearance through nested props.",bodyProps:{size:"L"},variant:"outlined"}},d={args:{title:"With Description",titleProps:{size:"M"},description:"This card uses the description prop instead of body for semantic clarity.",descriptionProps:{size:"M"},variant:"elevated"}},u={args:{title:"Media Card",titleProps:{size:"L"},cover:e.jsxDEV("img",{alt:"Placeholder content",src:"/placeholder.png",style:{height:"200px",objectFit:"cover"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:209,columnNumber:12},void 0),body:"Cards can display media content at the top with supporting text below.",variant:"outlined",hoverable:!0}},p={render:()=>{const T=[{key:"save",label:"Save Draft"},{key:"publish",label:"Publish"},{key:"cancel",label:"Cancel"}];return e.jsxDEV(V,{title:"Document Editor",icon:e.jsxDEV(t,{name:"pencil",ariaLabel:"pencil"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:230,columnNumber:48},void 0),iconProps:{position:"start"},body:"Card with multiple footer actions for user interactions.",actions:T,variant:"elevated"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:230,columnNumber:12},void 0)}},m={args:{title:"Interactive Card",icon:e.jsxDEV(t,{name:"github-logo",ariaLabel:"github-logo"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:238,columnNumber:11},void 0),iconProps:{position:"start"},subTitle:"Clickable surface",description:"Set `interactive` or `onClick` to make the card behave like a button without wrapping it in a link.",interactive:!0,hoverable:!0,variant:"outlined",onClick:()=>alert("Card clicked!")}},g={args:{title:"Portfolio Project",icon:e.jsxDEV(t,{name:"arrow-square-out",ariaLabel:"arrow-square-out"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:255,columnNumber:11},void 0),iconProps:{position:"end",size:"sm"},body:"This entire card functions as a clickable link while maintaining semantic structure.",link:"https://example.com",linkLabel:"View portfolio project details",variant:"elevated",hoverable:!0}},b={args:{title:"Compact Card",icon:e.jsxDEV(t,{name:"star",ariaLabel:"star"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:272,columnNumber:11},void 0),iconProps:{position:"start",size:"sm"},body:"Reduced padding for dense layouts.",size:"S",variant:"filled"}},h={args:{title:"Spacious Card",titleProps:{size:"XL"},icon:e.jsxDEV(t,{name:"heart",ariaLabel:"heart"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:288,columnNumber:11},void 0),iconProps:{position:"top",size:"lg"},body:"Generous spacing for prominent content areas.",bodyProps:{size:"L"},size:"L",variant:"elevated",hoverable:!0}},v={args:{title:"Sarah Johnson",titleProps:{size:"L"},subTitle:"Senior Designer",icon:e.jsxDEV(t,{name:"user",ariaLabel:"user"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:311,columnNumber:11},void 0),iconProps:{position:"start"},cover:e.jsxDEV("div",{style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",height:"120px"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:315,columnNumber:12},void 0),body:"Passionate about creating meaningful digital experiences with a focus on accessibility and user research.",variant:"elevated",hoverable:!0}},f={args:{title:"Page Views",titleProps:{size:"M"},body:"12,847",bodyProps:{size:"L"},description:"↗ 23% from last week",descriptionProps:{size:"S"},icon:e.jsxDEV(t,{name:"eye",ariaLabel:"eye"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:338,columnNumber:11},void 0),iconProps:{position:"end",size:"sm"},variant:"outlined",size:"S"}},y={args:{title:"Design System Workshop",titleProps:{size:"L"},subTitle:"Online Event",icon:e.jsxDEV(t,{name:"calendar",ariaLabel:"calendar"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:354,columnNumber:11},void 0),iconProps:{position:"start"},body:"Join us for an interactive session on building scalable design systems with modern tools and methodologies.",variant:"filled",hoverable:!0}},A=()=>{const T=[{key:"overview",label:"Overview"},{key:"details",label:"Details"},{key:"specs",label:"Specifications"},{key:"disabled",label:"Disabled",disabled:!0}],[W,F]=q.useState("overview"),B={overview:"This is the overview tab with general information.",details:"Detailed specifications and technical information.",specs:"Complete technical specifications and requirements."};return e.jsxDEV(V,{title:"Tabbed Interface",icon:e.jsxDEV(t,{name:"github-logo",ariaLabel:"github-logo"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:386,columnNumber:47},void 0),iconProps:{position:"start"},tabs:T,activeTabKey:W,onTabChange:F,body:B[W]||"Select a tab to view content",variant:"outlined"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:386,columnNumber:10},void 0)},C={render:()=>e.jsxDEV(A,{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:391,columnNumber:17},void 0)},w={args:{title:"Digital Portfolio",titleProps:{size:"L"},icon:e.jsxDEV(t,{name:"palette",ariaLabel:"palette"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:401,columnNumber:11},void 0),iconProps:{position:"start"},cover:e.jsxDEV("img",{alt:"Project screenshot",src:"/placeholder.png",style:{height:"180px",objectFit:"cover"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:405,columnNumber:12},void 0),body:"A comprehensive portfolio showcasing creative development and strategic design thinking.",link:"/portfolio",linkLabel:"View full portfolio",variant:"elevated",hoverable:!0}},P={args:{title:"Creative Development",titleProps:{size:"L"},icon:e.jsxDEV(t,{name:"palette",ariaLabel:"palette"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:422,columnNumber:11},void 0),iconProps:{position:"top",size:"lg"},description:"Building digital experiences that combine aesthetic excellence with functional innovation.",descriptionProps:{size:"M"},variant:"elevated",hoverable:!0,size:"L"}},x={args:{title:"New Feature",badge:"Beta",badgeProps:{state:"info",position:"end"},body:"This card demonstrates badge positioning at the end of the header.",variant:"outlined"}},z={args:{title:"Critical Issue",badge:"3",badgeProps:{state:"error",position:"start",size:"s"},icon:e.jsxDEV(t,{name:"bug",ariaLabel:"bug"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:459,columnNumber:11},void 0),iconProps:{position:"end",size:"sm"},body:"Badge positioned at the start of the header with an icon at the end.",variant:"elevated"}},S={args:{title:"Premium Service",badge:e.jsxDEV(t,{name:"star",ariaLabel:"star",style:{color:"var(--color-warning, #fbbf24)"}},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:471,columnNumber:12},void 0),body:"Custom React element as badge content.",variant:"filled"}},L={args:{title:"Form Submitted",icon:e.jsxDEV(t,{name:"check",ariaLabel:"check"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:483,columnNumber:11},void 0),iconProps:{position:"start",size:"md"},statusMessage:"Your information has been successfully saved.",statusMessageProps:{state:"success"},body:"Thank you for your submission. You will receive a confirmation email shortly.",variant:"elevated"}},k={args:{title:"Validation Error",icon:e.jsxDEV(t,{name:"warning",ariaLabel:"warning"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:499,columnNumber:11},void 0),iconProps:{position:"start",size:"md"},statusMessage:"Please check the required fields and try again.",statusMessageProps:{state:"error"},body:"Some fields contain invalid data that needs to be corrected.",variant:"outlined"}},N={args:{title:"Storage Almost Full",statusMessage:"You have used 90% of your storage quota.",statusMessageProps:{state:"warning"},body:"Consider upgrading your plan or removing unused files.",variant:"filled",hoverable:!0}},D={args:{title:"Compact Card",size:"S",badge:"New",badgeProps:{state:"success",size:"s"},body:"Small card with 320px max-width for dense layouts.",variant:"outlined"}},M={args:{title:"Medium Card",size:"M",icon:e.jsxDEV(t,{name:"user",ariaLabel:"user"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:543,columnNumber:11},void 0),iconProps:{position:"start"},body:"Medium card with 480px max-width for balanced content.",variant:"elevated"}},E={args:{title:"Large Card",size:"L",icon:e.jsxDEV(t,{name:"chart-line-up",ariaLabel:"chart-line-up"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:555,columnNumber:11},void 0),iconProps:{position:"top",size:"lg"},body:"Large card with 600px max-width for detailed content and generous spacing.",variant:"filled",hoverable:!0}},j={args:{title:"Full-Width Card",size:"full",statusMessage:"This card spans the full width of its container.",statusMessageProps:{state:"info"},body:"Full-width cards adapt to their container and are useful for dashboard layouts.",variant:"elevated"}},I={args:{title:"Feature Request",titleProps:{size:"L"},icon:e.jsxDEV(t,{name:"palette",ariaLabel:"palette"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/components/Card/Card.stories.tsx",lineNumber:585,columnNumber:11},void 0),iconProps:{position:"start",size:"md"},badge:"High Priority",badgeProps:{state:"warning",position:"end"},statusMessage:"Waiting for product team review",statusMessageProps:{state:"info"},body:"A comprehensive example showcasing multiple Card features working together.",variant:"elevated",hoverable:!0,size:"L"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Card Playground",
    subTitle: "Interactive testing",
    body: "Use the controls panel to explore different Card configurations and features.",
    icon: <Icon name="palette" ariaLabel="palette" />,
    iconProps: {
      position: "start",
      size: "md"
    },
    badge: "Demo",
    badgeProps: {
      state: "info",
      position: "end"
    },
    variant: "outlined",
    size: "M",
    hoverable: true
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Default Card",
    body: "Simple card with basic content and default styling."
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Hoverable Card",
    body: "This card responds to hover with subtle elevation and background changes.",
    hoverable: true
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Loading Card",
    loading: true,
    body: "Content hidden during loading state"
  }
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Creative Development",
    icon: <Icon name="palette" ariaLabel="palette" />,
    iconProps: {
      position: "start",
      size: "md"
    },
    body: "Digital experiences that combine aesthetic excellence with functional innovation.",
    variant: "elevated",
    hoverable: true
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: "External Link",
    icon: <Icon name="arrow-square-out" ariaLabel="arrow-square-out" />,
    iconProps: {
      position: "end",
      size: "sm"
    },
    body: "Card with trailing icon to indicate external navigation.",
    variant: "outlined"
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Strategy & Analytics",
    icon: <Icon name="chart-line-up" ariaLabel="chart-line-up" />,
    iconProps: {
      position: "top",
      size: "lg"
    },
    body: "Strategic thinking meets data visualization to create meaningful insights.",
    variant: "filled"
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Custom Typography",
    titleProps: {
      size: "L"
    },
    subTitle: "Subtitle with custom styling",
    subTitleProps: {
      size: "M"
    },
    body: "Body text with customized appearance through nested props.",
    bodyProps: {
      size: "L"
    },
    variant: "outlined"
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    title: "With Description",
    titleProps: {
      size: "M"
    },
    description: "This card uses the description prop instead of body for semantic clarity.",
    descriptionProps: {
      size: "M"
    },
    variant: "elevated"
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Media Card",
    titleProps: {
      size: "L"
    },
    cover: <img alt="Placeholder content" src="/placeholder.png" style={{
      height: "200px",
      objectFit: "cover"
    }} />,
    body: "Cards can display media content at the top with supporting text below.",
    variant: "outlined",
    hoverable: true
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const actions = [{
      key: "save",
      label: "Save Draft"
    }, {
      key: "publish",
      label: "Publish"
    }, {
      key: "cancel",
      label: "Cancel"
    }];
    return <Card title="Document Editor" icon={<Icon name="pencil" ariaLabel="pencil" />} iconProps={{
      position: "start"
    }} body="Card with multiple footer actions for user interactions." actions={actions} variant="elevated" />;
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Interactive Card",
    icon: <Icon name="github-logo" ariaLabel="github-logo" />,
    iconProps: {
      position: "start"
    },
    subTitle: "Clickable surface",
    description: "Set \`interactive\` or \`onClick\` to make the card behave like a button without wrapping it in a link.",
    interactive: true,
    hoverable: true,
    variant: "outlined",
    onClick: () => alert("Card clicked!")
  }
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Portfolio Project",
    icon: <Icon name="arrow-square-out" ariaLabel="arrow-square-out" />,
    iconProps: {
      position: "end",
      size: "sm"
    },
    body: "This entire card functions as a clickable link while maintaining semantic structure.",
    link: "https://example.com",
    linkLabel: "View portfolio project details",
    variant: "elevated",
    hoverable: true
  }
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Compact Card",
    icon: <Icon name="star" ariaLabel="star" />,
    iconProps: {
      position: "start",
      size: "sm"
    },
    body: "Reduced padding for dense layouts.",
    size: "S",
    variant: "filled"
  }
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Spacious Card",
    titleProps: {
      size: "XL"
    },
    icon: <Icon name="heart" ariaLabel="heart" />,
    iconProps: {
      position: "top",
      size: "lg"
    },
    body: "Generous spacing for prominent content areas.",
    bodyProps: {
      size: "L"
    },
    size: "L",
    variant: "elevated",
    hoverable: true
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Sarah Johnson",
    titleProps: {
      size: "L"
    },
    subTitle: "Senior Designer",
    icon: <Icon name="user" ariaLabel="user" />,
    iconProps: {
      position: "start"
    },
    cover: <div style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      height: "120px"
    }} />,
    body: "Passionate about creating meaningful digital experiences with a focus on accessibility and user research.",
    variant: "elevated",
    hoverable: true
  }
}`,...v.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Page Views",
    titleProps: {
      size: "M"
    },
    body: "12,847",
    bodyProps: {
      size: "L"
    },
    description: "↗ 23% from last week",
    descriptionProps: {
      size: "S"
    },
    icon: <Icon name="eye" ariaLabel="eye" />,
    iconProps: {
      position: "end",
      size: "sm"
    },
    variant: "outlined",
    size: "S"
  }
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Design System Workshop",
    titleProps: {
      size: "L"
    },
    subTitle: "Online Event",
    icon: <Icon name="calendar" ariaLabel="calendar" />,
    iconProps: {
      position: "start"
    },
    body: "Join us for an interactive session on building scalable design systems with modern tools and methodologies.",
    variant: "filled",
    hoverable: true
  }
}`,...y.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <TabbedStoryComponent />
}`,...C.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Digital Portfolio",
    titleProps: {
      size: "L"
    },
    icon: <Icon name="palette" ariaLabel="palette" />,
    iconProps: {
      position: "start"
    },
    cover: <img alt="Project screenshot" src="/placeholder.png" style={{
      height: "180px",
      objectFit: "cover"
    }} />,
    body: "A comprehensive portfolio showcasing creative development and strategic design thinking.",
    link: "/portfolio",
    linkLabel: "View full portfolio",
    variant: "elevated",
    hoverable: true
  }
}`,...w.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Creative Development",
    titleProps: {
      size: "L"
    },
    icon: <Icon name="palette" ariaLabel="palette" />,
    iconProps: {
      position: "top",
      size: "lg"
    },
    description: "Building digital experiences that combine aesthetic excellence with functional innovation.",
    descriptionProps: {
      size: "M"
    },
    variant: "elevated",
    hoverable: true,
    size: "L"
  }
}`,...P.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    title: "New Feature",
    badge: "Beta",
    badgeProps: {
      state: "info",
      position: "end"
    },
    body: "This card demonstrates badge positioning at the end of the header.",
    variant: "outlined"
  }
}`,...x.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Critical Issue",
    badge: "3",
    badgeProps: {
      state: "error",
      position: "start",
      size: "s"
    },
    icon: <Icon name="bug" ariaLabel="bug" />,
    iconProps: {
      position: "end",
      size: "sm"
    },
    body: "Badge positioned at the start of the header with an icon at the end.",
    variant: "elevated"
  }
}`,...z.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Premium Service",
    badge: <Icon name="star" ariaLabel="star" style={{
      color: "var(--color-warning, #fbbf24)"
    }} />,
    body: "Custom React element as badge content.",
    variant: "filled"
  }
}`,...S.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Form Submitted",
    icon: <Icon name="check" ariaLabel="check" />,
    iconProps: {
      position: "start",
      size: "md"
    },
    statusMessage: "Your information has been successfully saved.",
    statusMessageProps: {
      state: "success"
    },
    body: "Thank you for your submission. You will receive a confirmation email shortly.",
    variant: "elevated"
  }
}`,...L.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Validation Error",
    icon: <Icon name="warning" ariaLabel="warning" />,
    iconProps: {
      position: "start",
      size: "md"
    },
    statusMessage: "Please check the required fields and try again.",
    statusMessageProps: {
      state: "error"
    },
    body: "Some fields contain invalid data that needs to be corrected.",
    variant: "outlined"
  }
}`,...k.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Storage Almost Full",
    statusMessage: "You have used 90% of your storage quota.",
    statusMessageProps: {
      state: "warning"
    },
    body: "Consider upgrading your plan or removing unused files.",
    variant: "filled",
    hoverable: true
  }
}`,...N.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Compact Card",
    size: "S",
    badge: "New",
    badgeProps: {
      state: "success",
      size: "s"
    },
    body: "Small card with 320px max-width for dense layouts.",
    variant: "outlined"
  }
}`,...D.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Medium Card",
    size: "M",
    icon: <Icon name="user" ariaLabel="user" />,
    iconProps: {
      position: "start"
    },
    body: "Medium card with 480px max-width for balanced content.",
    variant: "elevated"
  }
}`,...M.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Large Card",
    size: "L",
    icon: <Icon name="chart-line-up" ariaLabel="chart-line-up" />,
    iconProps: {
      position: "top",
      size: "lg"
    },
    body: "Large card with 600px max-width for detailed content and generous spacing.",
    variant: "filled",
    hoverable: true
  }
}`,...E.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Full-Width Card",
    size: "full",
    statusMessage: "This card spans the full width of its container.",
    statusMessageProps: {
      state: "info"
    },
    body: "Full-width cards adapt to their container and are useful for dashboard layouts.",
    variant: "elevated"
  }
}`,...j.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Feature Request",
    titleProps: {
      size: "L"
    },
    icon: <Icon name="palette" ariaLabel="palette" />,
    iconProps: {
      position: "start",
      size: "md"
    },
    badge: "High Priority",
    badgeProps: {
      state: "warning",
      position: "end"
    },
    statusMessage: "Waiting for product team review",
    statusMessageProps: {
      state: "info"
    },
    body: "A comprehensive example showcasing multiple Card features working together.",
    variant: "elevated",
    hoverable: true,
    size: "L"
  }
}`,...I.parameters?.docs?.source}}};const X=["Playground","Default","Hoverable","Loading","WithIconStart","WithIconEnd","WithIconTop","CustomizedTypography","DescriptionVariant","WithCover","WithActions","Interactive","AsLink","SmallSize","LargeSize","ProfileCard","MetricCard","EventCard","Tabbed","ProjectCard","ServiceHighlight","WithBadgeEnd","WithBadgeStart","WithCustomBadge","WithSuccessMessage","WithErrorMessage","WithWarningMessage","SizeSmall","SizeMedium","SizeLarge","SizeFullWidth","ComplexExample"];export{g as AsLink,I as ComplexExample,c as CustomizedTypography,r as Default,d as DescriptionVariant,y as EventCard,n as Hoverable,m as Interactive,h as LargeSize,i as Loading,f as MetricCard,a as Playground,v as ProfileCard,w as ProjectCard,P as ServiceHighlight,j as SizeFullWidth,E as SizeLarge,M as SizeMedium,D as SizeSmall,b as SmallSize,C as Tabbed,p as WithActions,x as WithBadgeEnd,z as WithBadgeStart,u as WithCover,S as WithCustomBadge,k as WithErrorMessage,s as WithIconEnd,o as WithIconStart,l as WithIconTop,L as WithSuccessMessage,N as WithWarningMessage,X as __namedExportsOrder,U as default};
