import{u as d,r as o,j as e,H as h,a as x,G as r,L as u}from"./index-Y5ED3sA-.js";import{T as g}from"./Title-s-KPMBNR.js";const p="_home_huta7_4",j="_hero_huta7_9",_="_lead_huta7_20",v="_cta_huta7_28",k="_gradientText_huta7_47",T="_about_huta7_80",b="_gridItemBlank_huta7_80",n={home:p,hero:j,lead:_,cta:v,gradientText:k,about:T,gridItemBlank:b},M=()=>{const{t}=d(),a=[t("homeCreativeDevelopment"),t("homeStrategyBranding"),t("homeIllustrationEditorial")],[i,s]=o.useState(a[0]);return o.useEffect(()=>{s(a[0]);const c=setInterval(()=>{s(l=>{const m=(a.indexOf(l)+1)%a.length;return a[m]})},3e3);return()=>clearInterval(c)},[t]),e.jsxs(e.Fragment,{children:[e.jsx(h,{children:e.jsxs(x,{children:[e.jsx("title",{children:t("homeMetaTitle")}),e.jsx("meta",{name:"description",content:t("homeMetaDescription")}),e.jsx("meta",{property:"og:title",content:t("homeMetaTitle")}),e.jsx("meta",{property:"og:description",content:t("homeMetaDescription")}),e.jsx("meta",{property:"og:image",content:"/logo512.png"}),e.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),e.jsx("meta",{name:"twitter:title",content:t("homeMetaTitle")}),e.jsx("meta",{name:"twitter:description",content:t("homeMetaDescription")}),e.jsx("meta",{name:"twitter:image",content:"/logo512.png"})]})}),e.jsxs("div",{className:n.home,children:[e.jsx("section",{className:n.hero,children:e.jsxs(r,{columns:1,gap:"1rem",children:[e.jsx("div",{style:{gridColumn:"1 / span 3",background:"var(--home-gradient)",backgroundSize:"200% 200%",animation:"gradientMove 4s ease-in-out infinite",height:"75vh"}}),e.jsx("style",{children:`
                @keyframes gradientMove {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `})]})}),e.jsxs("section",{className:n.about,children:[e.jsx(g,{className:n.gradientText,level:1,size:"XL",children:i}),e.jsx(r,{columns:3,gap:"1rem",children:e.jsx("div",{className:n.gridItemBlank,style:{gridColumn:"2 / span 2"},children:e.jsx("p",{className:n.lead,children:t("homeAbout")})})})]}),e.jsxs("section",{className:n.cta,children:[e.jsx("h2",{children:t("homeCtaTitle")}),e.jsx(u,{className:n.ctaLink,href:"/contact",children:t("homeCtaLink")})]})]})]})};export{M as default};
