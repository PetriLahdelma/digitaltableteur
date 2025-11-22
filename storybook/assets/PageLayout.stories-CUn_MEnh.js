import{j as e}from"./iframe-C1Cq5wbO.js";import"./preload-helper-D1UD9lgW.js";const V="_pageLayout_6dbxe_3",j="_maxWidthSm_6dbxe_10",W="_maxWidthMd_6dbxe_15",M="_maxWidthLg_6dbxe_20",S="_maxWidthXl_6dbxe_25",_="_maxWidthFull_6dbxe_30",T="_grid_6dbxe_36",H="_withMargins_6dbxe_62",B="_spacingCompact_6dbxe_86",R="_spacingDefault_6dbxe_90",q="_spacingComfortable_6dbxe_94",A="_spacingSpacious_6dbxe_98",n={pageLayout:V,maxWidthSm:j,maxWidthMd:W,maxWidthLg:M,maxWidthXl:S,maxWidthFull:_,grid:T,withMargins:H,spacingCompact:B,spacingDefault:R,spacingComfortable:q,spacingSpacious:A},r=({children:a,maxWidth:f="lg",grid:x=!1,columns:y,spacing:N="default",withMargins:P=!0,className:v="",as:w="div",role:C,ariaLabel:D})=>{const k=[n.pageLayout,n[`maxWidth${f.charAt(0).toUpperCase()+f.slice(1)}`],n[`spacing${N.charAt(0).toUpperCase()+N.slice(1)}`],x&&n.grid,P&&n.withMargins,v].filter(Boolean).join(" "),E=(()=>{if(!x||y==null)return{};const L=Math.max(1,Math.floor(Number(y)));return Number.isFinite(L)?{gridTemplateColumns:`repeat(${L}, 1fr)`}:{}})();return e.jsxDEV(w,{className:k,style:E,role:C,"aria-label":D,children:a},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.tsx",lineNumber:113,columnNumber:5},void 0)};r.__docgenInfo={description:`PageLayout provides a consistent, responsive layout container with optional grid system.
Implements a 12-column grid on desktop, 8 columns on tablet, and 4 columns on mobile.

@example
\`\`\`tsx
<PageLayout maxWidth="lg" spacing="comfortable">
  <h1>Page Title</h1>
  <p>Content goes here...</p>
</PageLayout>
\`\`\`

@example With Grid
\`\`\`tsx
<PageLayout grid maxWidth="xl">
  <div style={{ gridColumn: 'span 6' }}>Left column</div>
  <div style={{ gridColumn: 'span 6' }}>Right column</div>
</PageLayout>
\`\`\``,methods:[],displayName:"PageLayout",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Content to be displayed within the layout"},maxWidth:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg" | "xl" | "full"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'},{name:"literal",value:'"xl"'},{name:"literal",value:'"full"'}]},description:`Maximum width constraint for the content
@default "lg"`,defaultValue:{value:'"lg"',computed:!1}},grid:{required:!1,tsType:{name:"boolean"},description:`Whether to use the 12-column grid system
@default false`,defaultValue:{value:"false",computed:!1}},columns:{required:!1,tsType:{name:"number"},description:`Number of columns for grid layout (only applies when grid=true)
Automatically responsive: 4 cols mobile, 8 cols tablet, 12 cols desktop`},spacing:{required:!1,tsType:{name:"union",raw:'"compact" | "default" | "comfortable" | "spacious"',elements:[{name:"literal",value:'"compact"'},{name:"literal",value:'"default"'},{name:"literal",value:'"comfortable"'},{name:"literal",value:'"spacious"'}]},description:`Vertical spacing between sections
@default "default"`,defaultValue:{value:'"default"',computed:!1}},withMargins:{required:!1,tsType:{name:"boolean"},description:`Apply consistent page margins
@default true`,defaultValue:{value:"true",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional CSS class name",defaultValue:{value:'""',computed:!1}},as:{required:!1,tsType:{name:"union",raw:'"div" | "main" | "section" | "article"',elements:[{name:"literal",value:'"div"'},{name:"literal",value:'"main"'},{name:"literal",value:'"section"'},{name:"literal",value:'"article"'}]},description:`Semantic HTML element to use for the container
@default "div"`,defaultValue:{value:'"div"',computed:!1}},role:{required:!1,tsType:{name:"string"},description:"ARIA role for accessibility"},ariaLabel:{required:!1,tsType:{name:"string"},description:"ARIA label for accessibility"}}};const I={title:"Patterns/PageLayout",component:r,parameters:{layout:"fullscreen",wip:{disabled:!1}},argTypes:{maxWidth:{control:"select",options:["sm","md","lg","xl","full"],description:"Maximum width constraint"},spacing:{control:"select",options:["compact","default","comfortable","spacious"],description:"Vertical spacing"},grid:{control:"boolean",description:"Enable 12-column grid system"},withMargins:{control:"boolean",description:"Apply page margins"}}},t=({gridColumn:a})=>e.jsxDEV("div",{style:{padding:"1.5rem",background:"var(--color-primary)",color:"var(--inverted-text-color)",borderRadius:"8px",gridColumn:a,minHeight:"100px",display:"flex",alignItems:"center",justifyContent:"center"},children:"Content Block"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:42,columnNumber:7},void 0),i={args:{maxWidth:"lg",spacing:"default",withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("h1",{style:{marginBlockEnd:"1rem"},children:"Page Title"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:62,columnNumber:7},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:"This is a default page layout with standard spacing and a large max-width container. The content is automatically centered and has responsive margins."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:65,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:61,columnNumber:19},void 0)},s={args:{maxWidth:"sm",spacing:"default",withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("h2",{style:{marginBlockEnd:"1rem"},children:"Small Container (640px max)"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:81,columnNumber:7},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:"Ideal for focused content like blog posts or forms. The narrow width improves readability for long-form text."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:84,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:80,columnNumber:19},void 0)},o={args:{maxWidth:"md",spacing:"comfortable",withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("h2",{style:{marginBlockEnd:"1rem"},children:"Medium Container (960px max)"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:99,columnNumber:7},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:"Perfect for documentation, articles, and standard content pages. Comfortable spacing provides breathing room."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:102,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:98,columnNumber:19},void 0)},l={args:{maxWidth:"lg",spacing:"spacious",withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("h2",{style:{marginBlockEnd:"1rem"},children:"Large Container (1200px max)"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:117,columnNumber:7},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:"Suitable for dashboards, product showcases, and multi-column layouts. Spacious vertical rhythm creates a premium feel."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:120,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:116,columnNumber:19},void 0)},u={args:{maxWidth:"xl",spacing:"default",withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("h2",{style:{marginBlockEnd:"1rem"},children:"Extra Large Container (1440px max)"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:135,columnNumber:7},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:"For wide desktop displays and complex layouts requiring more horizontal space."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:140,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:134,columnNumber:19},void 0)},d={args:{maxWidth:"full",spacing:"default",withMargins:!1},render:a=>e.jsxDEV(r,{...a,children:e.jsxDEV("div",{style:{padding:"var(--space-layout-32)"},children:[e.jsxDEV("h2",{style:{marginBlockEnd:"1rem"},children:"Full Width Layout"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:158,columnNumber:9},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:"Spans the entire viewport width. Useful for hero sections, image galleries, or immersive experiences."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:161,columnNumber:9},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:155,columnNumber:7},void 0)},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:154,columnNumber:19},void 0)},m={args:{maxWidth:"md",spacing:"compact",withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("h2",{children:"Compact Spacing"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:177,columnNumber:7},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-normal)"},children:"Minimal vertical padding for dense interfaces or components that manage their own spacing."},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:178,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:176,columnNumber:19},void 0)},g={args:{maxWidth:"lg",spacing:"comfortable",grid:!0,withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV(t,{gridColumn:"span 6"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:194,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 6"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:195,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:193,columnNumber:19},void 0)},c={args:{maxWidth:"xl",spacing:"default",grid:!0,withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:206,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:207,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:208,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:205,columnNumber:19},void 0)},p={args:{maxWidth:"lg",spacing:"comfortable",grid:!0,withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV(t,{gridColumn:"span 8"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:219,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:220,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:218,columnNumber:19},void 0)},h={args:{maxWidth:"xl",spacing:"comfortable",grid:!0,withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV(t,{gridColumn:"span 12"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:231,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:232,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:233,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:234,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 6"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:235,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 6"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:236,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 3"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:237,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 3"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:238,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 3"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:239,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 3"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:240,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:230,columnNumber:19},void 0)},b={args:{maxWidth:"lg",spacing:"comfortable",grid:!0,withMargins:!0},render:a=>e.jsxDEV(r,{...a,children:[e.jsxDEV("div",{style:{gridColumn:"span 12",padding:"1.5rem",background:"var(--color-light-bg)",borderRadius:"8px"},children:[e.jsxDEV("h2",{style:{marginBlockEnd:"1rem"},children:"Responsive Grid System"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:257,columnNumber:9},void 0),e.jsxDEV("p",{style:{lineHeight:"var(--line-height-relaxed)"},children:["• Desktop (≥1024px): 12 columns with 32px gaps",e.jsxDEV("br",{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:264,columnNumber:11},void 0),"• Tablet (768-1023px): 8 columns with 24px gaps",e.jsxDEV("br",{},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:266,columnNumber:11},void 0),"• Mobile (<768px): 4 columns with 16px gaps"]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:260,columnNumber:9},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:251,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 6"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:269,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 6"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:270,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:271,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:272,columnNumber:7},void 0),e.jsxDEV(t,{gridColumn:"span 4"},void 0,!1,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:273,columnNumber:7},void 0)]},void 0,!0,{fileName:"/home/runner/work/digitaltableteur/digitaltableteur/src/patterns/PageLayout/PageLayout.stories.tsx",lineNumber:250,columnNumber:19},void 0)};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "lg",
    spacing: "default",
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <h1 style={{
      marginBlockEnd: "1rem"
    }}>Page Title</h1>
      <p style={{
      lineHeight: "var(--line-height-relaxed)"
    }}>
        This is a default page layout with standard spacing and a large
        max-width container. The content is automatically centered and has
        responsive margins.
      </p>
    </PageLayout>
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "sm",
    spacing: "default",
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <h2 style={{
      marginBlockEnd: "1rem"
    }}>Small Container (640px max)</h2>
      <p style={{
      lineHeight: "var(--line-height-relaxed)"
    }}>
        Ideal for focused content like blog posts or forms. The narrow width
        improves readability for long-form text.
      </p>
    </PageLayout>
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "md",
    spacing: "comfortable",
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <h2 style={{
      marginBlockEnd: "1rem"
    }}>Medium Container (960px max)</h2>
      <p style={{
      lineHeight: "var(--line-height-relaxed)"
    }}>
        Perfect for documentation, articles, and standard content pages.
        Comfortable spacing provides breathing room.
      </p>
    </PageLayout>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "lg",
    spacing: "spacious",
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <h2 style={{
      marginBlockEnd: "1rem"
    }}>Large Container (1200px max)</h2>
      <p style={{
      lineHeight: "var(--line-height-relaxed)"
    }}>
        Suitable for dashboards, product showcases, and multi-column layouts.
        Spacious vertical rhythm creates a premium feel.
      </p>
    </PageLayout>
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "xl",
    spacing: "default",
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <h2 style={{
      marginBlockEnd: "1rem"
    }}>
        Extra Large Container (1440px max)
      </h2>
      <p style={{
      lineHeight: "var(--line-height-relaxed)"
    }}>
        For wide desktop displays and complex layouts requiring more horizontal
        space.
      </p>
    </PageLayout>
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "full",
    spacing: "default",
    withMargins: false
  },
  render: args => <PageLayout {...args}>
      <div style={{
      padding: "var(--space-layout-32)"
    }}>
        <h2 style={{
        marginBlockEnd: "1rem"
      }}>Full Width Layout</h2>
        <p style={{
        lineHeight: "var(--line-height-relaxed)"
      }}>
          Spans the entire viewport width. Useful for hero sections, image
          galleries, or immersive experiences.
        </p>
      </div>
    </PageLayout>
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "md",
    spacing: "compact",
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <h2>Compact Spacing</h2>
      <p style={{
      lineHeight: "var(--line-height-normal)"
    }}>
        Minimal vertical padding for dense interfaces or components that manage
        their own spacing.
      </p>
    </PageLayout>
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "lg",
    spacing: "comfortable",
    grid: true,
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
    </PageLayout>
}`,...g.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "xl",
    spacing: "default",
    grid: true,
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "lg",
    spacing: "comfortable",
    grid: true,
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <DemoContent gridColumn="span 8" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "xl",
    spacing: "comfortable",
    grid: true,
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <DemoContent gridColumn="span 12" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 3" />
      <DemoContent gridColumn="span 3" />
      <DemoContent gridColumn="span 3" />
      <DemoContent gridColumn="span 3" />
    </PageLayout>
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: "lg",
    spacing: "comfortable",
    grid: true,
    withMargins: true
  },
  render: args => <PageLayout {...args}>
      <div style={{
      gridColumn: "span 12",
      padding: "1.5rem",
      background: "var(--color-light-bg)",
      borderRadius: "8px"
    }}>
        <h2 style={{
        marginBlockEnd: "1rem"
      }}>Responsive Grid System</h2>
        <p style={{
        lineHeight: "var(--line-height-relaxed)"
      }}>
          • Desktop (≥1024px): 12 columns with 32px gaps
          <br />
          • Tablet (768-1023px): 8 columns with 24px gaps
          <br />• Mobile (&lt;768px): 4 columns with 16px gaps
        </p>
      </div>
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
}`,...b.parameters?.docs?.source}}};const U=["Default","SmallContainer","MediumContainer","LargeContainer","ExtraLargeContainer","FullWidth","CompactSpacing","TwoColumnGrid","ThreeColumnGrid","AsymmetricGrid","ComplexGrid","ResponsiveShowcase"];export{p as AsymmetricGrid,m as CompactSpacing,h as ComplexGrid,i as Default,u as ExtraLargeContainer,d as FullWidth,l as LargeContainer,o as MediumContainer,b as ResponsiveShowcase,s as SmallContainer,c as ThreeColumnGrid,g as TwoColumnGrid,U as __namedExportsOrder,I as default};
