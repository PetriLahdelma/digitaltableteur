import{R as a,j as t}from"./index-AOEoW7Bw.js";const r={},b=a.createContext(r);function i(n){const e=a.useContext(b);return a.useMemo(function(){return typeof n=="function"?n(e):{...e,...n}},[e,n])}function G(n){let e;return n.disableParentContext?e=typeof n.components=="function"?n.components(r):n.components||r:e=i(n.components),a.createElement(b.Provider,{value:e},n.children)}const x={title:"Design System Meets AI: Building the Self-Evolving Component Library Pt 1",slug:"design-system-meets-ai-building-the-self-evolving-component-library-pt-1",publishedAt:"2025-11-20T22:08:00.000Z",readTime:"4 min",excerpt:"A 5-part series exploring how design systems transform in the age of AI.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma"};function l(n){const e={br:"br",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.h2,{children:"Why Your Design System Must Evolve (And Why Most Aren’t Ready)"}),`
`,t.jsx(e.h3,{children:"The design system problem nobody likes to admit"}),`
`,t.jsx(e.p,{children:"Most design systems were never built with intelligence in mind."}),`
`,t.jsxs(e.p,{children:["They were built for consistency. For governance. For speed. For scale.",t.jsx(e.br,{}),`
`,"They were not built for unpredictability, generativity, or continuous adaptation."]}),`
`,t.jsx(e.p,{children:"And that was fine — until AI entered the room."}),`
`,t.jsxs(e.p,{children:["Suddenly, teams are introducing interfaces that don’t just display content, but ",t.jsx(e.em,{children:"create it"}),". Systems that recommend layouts. Input fields that behave like collaborators. Interfaces that shift based on intent, not just interaction."]}),`
`,t.jsx(e.p,{children:"Traditional component libraries collapse under this pressure because they assume:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"finite states"}),`
`,t.jsx(e.li,{children:"predictable flows"}),`
`,t.jsx(e.li,{children:"clear user intent"}),`
`,t.jsx(e.li,{children:"human-driven decision making"}),`
`]}),`
`,t.jsx(e.p,{children:"AI breaks all of those assumptions."}),`
`,t.jsxs(e.p,{children:["The core issue isn’t that design systems are “old-fashioned”.",t.jsx(e.br,{}),`
`,"It’s that they were built for ",t.jsx(e.strong,{children:"static reality in a dynamic world"}),"."]}),`
`,t.jsx(e.h2,{children:"The shift from consistency to intelligence"}),`
`,t.jsxs(e.p,{children:["Classic design systems are rule-based.",t.jsx(e.br,{}),`
`,"AI-native systems are pattern-recognizing and context aware."]}),`
`,t.jsx(e.p,{children:"A traditional system answers:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"What does the button look like?"}),`
`,t.jsx(e.li,{children:"Which spacing token do we use?"}),`
`,t.jsx(e.li,{children:"What happens on hover?"}),`
`]}),`
`,t.jsx(e.p,{children:"An AI-ready system must also answer:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"When should this layout adapt?"}),`
`,t.jsx(e.li,{children:"Should this component change behavior based on user intent?"}),`
`,t.jsx(e.li,{children:"What variant is most effective for this context?"}),`
`,t.jsx(e.li,{children:"How can the system suggest instead of just constrain?"}),`
`]}),`
`,t.jsxs(e.p,{children:["This is the difference between:",t.jsx(e.br,{}),`
`,"A design system as a ",t.jsx(e.strong,{children:"library of controls"}),t.jsx(e.br,{}),`
`,"vs",t.jsx(e.br,{}),`
`,"A design system as a ",t.jsx(e.strong,{children:"cognitive infrastructure"})]}),`
`,t.jsx(e.h2,{children:"Why static systems fail under AI pressure"}),`
`,t.jsx(e.p,{children:"AI introduces conditions that design systems were never meant to support:"}),`
`,t.jsx(e.h3,{children:"1. Infinite variability"}),`
`,t.jsxs(e.p,{children:["Generative systems don’t produce one outcome — they produce many.",t.jsx(e.br,{}),`
`,"Text, layouts, visuals, UI suggestions can change every second."]}),`
`,t.jsx(e.p,{children:"Your design system must now handle:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"dynamic content density"}),`
`,t.jsx(e.li,{children:"unpredictable text length"}),`
`,t.jsx(e.li,{children:"variable structure"}),`
`,t.jsx(e.li,{children:"real-time UI mutation"}),`
`]}),`
`,t.jsx(e.p,{children:"Fixed components become brittle."}),`
`,t.jsx(e.h3,{children:"2. Non-linear interaction"}),`
`,t.jsx(e.p,{children:"User journeys are no longer step-by-step flows — they’re conversational, contextual, evolving."}),`
`,t.jsx(e.p,{children:"The system must support:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"interruptions"}),`
`,t.jsx(e.li,{children:"reversals"}),`
`,t.jsx(e.li,{children:"branching logic"}),`
`,t.jsx(e.li,{children:"adaptive responses"}),`
`]}),`
`,t.jsx(e.p,{children:"Classic flow-based design patterns begin to look obsolete."}),`
`,t.jsx(e.h3,{children:"3. Machine participation in design"}),`
`,t.jsx(e.p,{children:"AI isn’t just helping produce assets — it is influencing design decisions."}),`
`,t.jsx(e.p,{children:"That means:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"Your system must be interpretable by machines"}),`
`,t.jsx(e.li,{children:"Your component logic must be describable, not just visible"}),`
`,t.jsx(e.li,{children:"Your rules must become data"}),`
`]}),`
`,t.jsx(e.p,{children:"A design system that cannot be reasoned about by machines will be bypassed by them."}),`
`,t.jsx(e.h2,{children:"From static library to living organism"}),`
`,t.jsx(e.p,{children:"A self-evolving design system treats components as:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"entities with behavior"}),`
`,t.jsx(e.li,{children:"units with memory"}),`
`,t.jsx(e.li,{children:"structures that learn"}),`
`]}),`
`,t.jsxs(e.p,{children:["This doesn’t mean autonomous chaos.",t.jsx(e.br,{}),`
`,"It means structured adaptability."]}),`
`,t.jsxs(e.p,{children:["Instead of asking:",t.jsx(e.br,{}),`
`,"“Is this the correct component?”"]}),`
`,t.jsxs(e.p,{children:["You begin asking:",t.jsx(e.br,{}),`
`,"“What is the most appropriate expression of this intent right now?”"]}),`
`,t.jsx(e.p,{children:"This shift is fundamental."}),`
`,t.jsx(e.h2,{children:"The new role of the design system"}),`
`,t.jsx(e.p,{children:"In an AI-first environment, the design system becomes:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"a recommendation engine"}),`
`,t.jsx(e.li,{children:"a governance framework"}),`
`,t.jsx(e.li,{children:"a knowledge base"}),`
`,t.jsx(e.li,{children:"a behavior model"}),`
`,t.jsx(e.li,{children:"a feedback system"}),`
`,t.jsx(e.li,{children:"a design intelligence layer"}),`
`]}),`
`,t.jsx(e.p,{children:"Not simply a UI kit."}),`
`,t.jsx(e.h2,{children:"The real risk: becoming a blocker"}),`
`,t.jsx(e.p,{children:"If design systems don’t evolve, three things happen:"}),`
`,t.jsx(e.p,{children:"Teams bypass them"}),`
`,t.jsx(e.p,{children:"AI tools hallucinate UI patterns"}),`
`,t.jsx(e.p,{children:"Product experience fragments"}),`
`,t.jsxs(e.p,{children:["When developers start saying:",t.jsx(e.br,{}),`
`,"“I’ll just generate this in Figma / AI / code, it’s faster than dealing with the system”"]}),`
`,t.jsx(e.p,{children:"You’ve already lost."}),`
`,t.jsx(e.p,{children:"Evolution is not optional. It’s survival."}),`
`,t.jsx(e.h2,{children:"The opportunity: systems that grow with you"}),`
`,t.jsxs(e.p,{children:["When a system is AI-ready, it doesn’t just enforce rules.",t.jsx(e.br,{}),`
`,"It supports discovery."]}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"It suggests components for new use cases"}),`
`,t.jsx(e.li,{children:"It highlights emerging patterns"}),`
`,t.jsx(e.li,{children:"It learns where friction appears"}),`
`,t.jsx(e.li,{children:"It evolves with product vision"}),`
`]}),`
`,t.jsx(e.p,{children:"This transforms your system from a maintenance burden into a strategic asset."})]})}function w(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(l,{...n})}):l(n)}const j=Object.freeze(Object.defineProperty({__proto__:null,default:w,frontmatter:x},Symbol.toStringTag,{value:"Module"})),v={title:"Designing in 2025",slug:"designing-in-2025",publishedAt:"2025-02-09T00:00:00.000Z",readTime:"5 min read",excerpt:"Navigating the AI-assisted creative landscape.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma"};function d(n){const e={blockquote:"blockquote",h2:"h2",li:"li",p:"p",ul:"ul",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"After more than two decades in the design field, I've had the pleasure and privilege of witnessing the practice evolve—from sketchbooks and static wireframes to collaborative, cloud-based systems that update in real-time. And now, in 2025, we're at the cusp of what may be the most profound shift yet: the rise of AI as a deeply embedded partner in the design process."}),`
`,t.jsx(e.p,{children:"Artificial Intelligence is no longer a novelty. It’s embedded in the very tools we use—from generative ideation and layout prediction to code generation and automated testing. But despite this acceleration, one truth endures: design is still a deeply human act."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"At its best, design is how we care for people at scale."}),`
`]}),`
`,t.jsx(e.p,{children:"Our challenge now is not about keeping up with the speed of machines"}),`
`,t.jsx(e.p,{children:"—it’s about preserving the purpose of design in an age of abundance."}),`
`,t.jsx(e.h2,{children:"Beyond Automation: Reclaiming the Core of Creative Work"}),`
`,t.jsx(e.p,{children:"We no longer face a blinking cursor on a blank canvas. AI can instantly generate layouts, suggest type pairings, or convert sketches into code. It’s impressive. But speed can’t replace soul. AI, in my experience, isn’t here to replace creativity—it’s here to amplify it. This means shifting our mindset. Not toward competing with machines, but toward outthinking them. Toward asking sharper questions. Challenging assumptions. Understanding people, behaviors, and contexts more deeply."}),`
`,t.jsx(e.p,{children:"Because in a world where any prompt can output a hundred variations, our craft becomes less about creation and more about curation. Less about what we can generate, and more about what we choose to keep. This is a return to judgment. To narrative. To human insight as the foundation of meaningful work."}),`
`,t.jsx(e.h2,{children:"AI as a Partner, Not a Proxy"}),`
`,t.jsx(e.p,{children:"There’s a myth that AI reduces the need for thinking. In practice, it does the opposite."}),`
`,t.jsx(e.p,{children:"Great AI tools remove friction, not responsibility. They clear the repetitive and procedural, allowing us to focus on higher-order challenges: behavior, structure, intention, emotion. That’s where modern creative leadership lives."}),`
`,t.jsx(e.p,{children:"When working with younger designers, I often tell them: Your job isn’t to outpace the machine. It’s to know what matters and why. To hold the line when an output is technically correct but emotionally hollow. AI can optimize. Only humans can care."}),`
`,t.jsx(e.p,{children:"To succeed in 2025, designers must become bilingual—fluent in both human needs and machine capabilities. Because AI isn’t replacing our language. It’s becoming part of it."}),`
`,t.jsx(e.h2,{children:"Design as Strategic Communication"}),`
`,t.jsx(e.p,{children:`With infinite content at our fingertips, the temptation is to flood the space with more. But "more" isn't the answer. "Better" is. Paradoxically, making is easier—but mattering is harder. Design must move from aesthetic polishing to strategic storytelling. In 2025, brands don't compete solely on product—they compete on clarity, relevance, and emotional resonance.`}),`
`,t.jsx(e.p,{children:"These are design problems. A great visual system is no longer just about a logo or a palette. It’s a behavioral signal: it tells people what you stand for. It creates trust. It builds consistency in a fragmented landscape. Done right, visual communication becomes a strategic layer—one that simplifies, clarifies, and connects."}),`
`,t.jsx(e.h2,{children:"From Stylist to Steward"}),`
`,t.jsx(e.p,{children:'One of the most significant shifts in the past decade is the evolution of our role. We’re no longer just stylists brought in at the end to "make it pretty." We’re stewards of systems. Authors of intent. Designers of participation. With AI in the mix, our responsibilities expand even further. We must now act as ethical gatekeepers:'}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"What data trained this model?"}),`
`,t.jsx(e.li,{children:"Who benefits from this feature—and who’s left out?"}),`
`,t.jsx(e.li,{children:"Are we reinforcing bias, or challenging it?"}),`
`]}),`
`,t.jsx(e.p,{children:"These aren’t edge cases. They are the new core of responsible design."}),`
`,t.jsx(e.h2,{children:"A Return to Purpose"}),`
`,t.jsx(e.p,{children:"Yes, tools will continue to evolve. But our greatest assets remain unchanged: empathy, curiosity, judgment, courage. These qualities don’t show up in any plugin. They’re not automatable. They’re earned—in practice, in conversation, in critique."}),`
`,t.jsx(e.p,{children:"As AI shifts how we design, it’s up to us to preserve why we design. Because the goal isn’t just to make things—it’s to make things matter. And in 2025, that principle has never been more vital. ☻"})]})}function k(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(d,{...n})}):d(n)}const T=Object.freeze(Object.defineProperty({__proto__:null,default:k,frontmatter:v},Symbol.toStringTag,{value:"Module"})),I={title:"Digital Craftsmanship",slug:"digital-craftsmanship",publishedAt:"2025-06-10T00:00:00.000Z",readTime:"4 min read",excerpt:"Thoughts on maintaining quality in a hurry-up culture.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma",mainImageUrl:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/46eb4a68c7bd8e08f23cb83b8ebba0a73925ed34-1440x962.jpg?w=1600"};function c(n){const e={blockquote:"blockquote",h2:"h2",p:"p",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Our very first lecture in design school was led by a passionate advocate for craftsmanship, Professor Tapio Vapaasalo. He began his lecture with showing a two distinctly different youtube videos. The first one featured a parrot that could mimic whatever the owner said, while the second one featured a craftsman who had spent years perfecting his skill. The difference was clear: the parrot could repeat words, but the craftsman created something meaningful."}),`
`,t.jsx(e.p,{children:"The tools are faster, the deadlines tighter, and the expectations steeper. Somewhere between shipping faster and scaling bigger, something subtle gets lost. Not visibly. But you can feel it — in the way a product handles, in how a brand sounds, in the absence of something quietly intentional."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"That something is craft."}),`
`]}),`
`,t.jsx(e.h2,{children:"Speed Isn’t the Enemy — Thoughtlessness Is"}),`
`,t.jsx(e.p,{children:"I’ve worked long enough in digital to know that slowness doesn’t equal quality. But there’s a difference between moving fast with intent and just pushing to ship. We’ve built pipelines that automate, generate, even decide for us. But no automation substitutes the quiet friction of asking: Does this feel right? Does this deserve to exist this way?"}),`
`,t.jsx(e.p,{children:"That pause is not inefficiency. It’s where meaning starts."}),`
`,t.jsx(e.h2,{children:"Craft Is in the Edges"}),`
`,t.jsx(e.p,{children:"Good design isn’t only in the headline or the layout — it lives in the in-between. The microcopy that never sounds off. The loading animation that softens a delay. The way a transition suggests something human was here, thinking about how it would feel — how others would feel using it."}),`
`,t.jsx(e.p,{children:"Craftsmanship is about honoring the parts that don’t shout but shape the whole. It’s not about polish. It’s about presence."}),`
`,t.jsx(e.h2,{children:"Quality in the Age of Generators"}),`
`,t.jsx(e.p,{children:"AI is writing copy, generating layouts, filling in alt texts and icons — and oftentimes doing it quite decently. But the danger isn’t in letting machines help. It’s in letting them decide what “good enough” looks like. When we stop noticing the difference, we stop caring."}),`
`,t.jsx(e.p,{children:"Craft today, more than ever, means keeping a human fingerprint on the product. Not because we should resist progress or the tools that deliver it, but because we’re still the ones accountable for the emotional resonance."}),`
`,t.jsx(e.h2,{children:"Leave Traces of Care"}),`
`,t.jsx(e.p,{children:"In every project, there’s a point where we could cut a corner and no one would notice. But someone always does — even if they can’t name it. Quality has a texture. It lingers. Not just in design, but in the culture it fosters: attention to detail becomes contagious. The team starts to raise their own bar."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"Digital craftsmanship isn’t about perfection. It’s about giving a damn."}),`
`]}),`
`,t.jsx(e.h2,{children:"In Praise of Slowness, Even When We’re Fast"}),`
`,t.jsx(e.p,{children:"We won’t go back to slower cycles. That’s not the point. But we can bake slowness into the process: quick iterations, slow reflection. Fast drafts, considered revisions. Space for questions no prompt can answer. In the end, craft is just a pattern of choices made deliberately, not reactively."}),`
`,t.jsx(e.p,{children:"In a hurry-up culture, choosing to care is radical.☻"})]})}function A(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(c,{...n})}):c(n)}const _=Object.freeze(Object.defineProperty({__proto__:null,default:A,frontmatter:I},Symbol.toStringTag,{value:"Module"})),C={title:"MCP, Design Systems, and Generative UI",slug:"figma-mcp-design-systems",publishedAt:"2025-06-05T00:00:00.000Z",readTime:"4 min read",excerpt:"How Figma's MCP server speeds up design-to-code workflows.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma",mainImageUrl:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/f89b3b77b080fe3d371cd0153eeb30d49429aaeb-1536x1024.webp?w=1600"};function h(n){const e={h2:"h2",img:"img",p:"p",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Recently, I experimented with Figma’s official MCP (Model Context Protocol) server in tandem with the dt design system, and the results were eye-opening. By enriching the components with machine-readable metadata directly within Figma, I unlocked a new layer of semantic clarity — not just for designers, but for tooling and automation as well. This integration allowed me to embed context such as intent, behavior, and variant logic directly into each component."}),`
`,t.jsx(e.p,{children:"When combined with a well-structured design system, this metadata forms a bridge between design and development that’s both expressive and efficient. It fundamentally shifts how we think about handoff: instead of static specs, we’re enabling a pipeline where components carry the instructions needed to generate real code or configure runtime behavior. This shift opens the door to smarter tooling, automatic documentation, and even generative UI workflows — all grounded in the source of truth that lives inside the design system."}),`
`,t.jsx(e.h2,{children:"The Problem with the Current Workflow"}),`
`,t.jsx(e.p,{children:"Even with well-documented systems, the handoff from designer to developer often involves a layer of translation—interpreting visual intent, cross-referencing token usage, and validating component variants. It’s a process that still relies heavily on human interpretation and manual alignment. Small details, like the exact padding on a card or the semantic use of a color token, can easily slip through the cracks, leading to inconsistencies in implementation. These discrepancies not only require back-and-forth to resolve but can also erode trust in the system itself. As a result, iteration slows down, and teams spend more time fixing gaps than pushing the experience forward."}),`
`,t.jsx(e.h2,{children:"What MCP Changes"}),`
`,t.jsx(e.p,{children:"MCP exposes design file data directly to code assistants. Instead of referencing screenshots or static specs, the assistant consumes real components, variants, and tokens right from Figma."}),`
`,t.jsx(e.p,{children:t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/d8ddbb3e1c3036b213a407fd34e859d2823da9f6-1536x1024.jpg?w=1600",alt:"Visual diagram outlining concepts related to digital transformation strategies."})}),`
`,t.jsx(e.p,{children:"This means the AI can generate code that’s not just visually accurate, but also semantically aligned with the design system’s intent. It understands how components relate to each other, what variants are available, and how tokens should be applied."}),`
`,t.jsx(e.p,{children:"In the trials I dropped a component URL into the editor and watched as it generated a nearly complete web component. Minor styling fixes aside, it was surprisingly production ready."}),`
`,t.jsx(e.h2,{children:"Design Systems as the Enabler"}),`
`,t.jsx(e.p,{children:"A consistent design system gives the MCP data meaning. Clear token names and predictable component structure help AI tools map design choices to code without guesswork."}),`
`,t.jsx(e.h2,{children:"Generative UI with Natural Language"}),`
`,t.jsx(e.p,{children:"I took it a step further by connecting the output to a local tool that generates layouts from text prompts. Typing “Build a login form” or “Create a three column feature grid” produces a quick preview that respects my components and styling conventions."}),`
`,t.jsx(e.h2,{children:"This Isn’t About Replacing Roles"}),`
`,t.jsx(e.p,{children:"Engineering still plays a critical role in refining the output, ensuring performance, scalability, and maintainability, while design continues to shape and own the overall user experience. But what’s changing is the nature of that collaboration. By automating the repetitive and predictable parts of the workflow — the boilerplate code, standard layout scaffolding, and component wiring — we’re reclaiming valuable time and cognitive energy. This gives teams space to focus on what actually matters: the edge cases that define polish, the accessibility nuances that ensure inclusivity, and the product vision that ties everything together into something coherent and meaningful. Rather than getting bogged down in tactical execution, both designers and developers can engage more deeply in strategic problem-solving, exploring interactions, flows, and ideas that elevate the product beyond the expected."}),`
`,t.jsx(e.h2,{children:"Where We’re Headed"}),`
`,t.jsx(e.p,{children:"At least my personal goal is to make this workflow approachable for bigger teams. With stable tools and repeatable patterns, the gap between idea and implementation keeps shrinking. It’s an exciting time to rethink how we collaborate—and MCP's are a big part of that conversation.☻"})]})}function M(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(h,{...n})}):h(n)}const S=Object.freeze(Object.defineProperty({__proto__:null,default:M,frontmatter:C},Symbol.toStringTag,{value:"Module"})),D={title:"Digitaltableteur Field Notes: In Search of Impact",slug:"in-search-of-impact",publishedAt:"2025-02-11T00:00:00.000Z",readTime:"4 min read",excerpt:"How a solo studio delivers enterprise-scale outcomes with boutique precision.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma",mainImageUrl:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/2c4621941096cd03ba2299862b591692feaf5854-1024x1024.png?w=1600"};function u(n){const e={blockquote:"blockquote",h2:"h2",li:"li",p:"p",ul:"ul",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Digitaltableteur is intentionally small—a one-person studio that blends strategy, design, and engineering without handing anything off. The “one-man army” model isn’t a constraint. It is the way the studio keeps every brief close to the craft, every sprint accountable, and every launch personal."}),`
`,t.jsx(e.p,{children:"When there is no internal bureaucracy, decisions aren’t diluted. The same person who listens to the client writes the narrative, designs the system, tunes the motion, and ships the code. That directness creates momentum the moment a project starts."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"Being small means every detail is on purpose—and every outcome has a name attached to it."}),`
`]}),`
`,t.jsx(e.h2,{children:"Why Stay Solo When the Work Is Big?"}),`
`,t.jsx(e.p,{children:"Most organizations swell with specialists. Digitaltableteur takes the opposite approach: keep the core tiny, then assemble collaborators only when the mission absolutely demands it. That preserves clarity of vision while still tapping world-class talent for illustration, research, or implementation scale."}),`
`,t.jsx(e.p,{children:"The benefits show up immediately:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"Single accountability: One owner for discovery, design systems, and deployment means no context gaps."}),`
`,t.jsx(e.li,{children:"Systemized craft: Tokens, typography, and code all live in the same stack, so nothing gets “polished later.”"}),`
`,t.jsx(e.li,{children:"Client proximity: Conversations happen with the person doing the work, not layers of account management."}),`
`]}),`
`,t.jsx(e.h2,{children:"The Operating Rhythm"}),`
`,t.jsx(e.p,{children:"Every engagement follows a tight cadence that keeps intent at the center:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"First discovery: Define the shift we want in user behavior or business outcomes before drawing a single frame."}),`
`,t.jsx(e.li,{children:"Concept sprints: Explore typography, motion, and interaction in rapid cycles to establish the tone."}),`
`,t.jsx(e.li,{children:"Integrated build: Storybook, production, and content operate from the same design system, removing translation debt."}),`
`,t.jsx(e.li,{children:"Observation loops: Post-launch analytics feed straight into new experiments—no quarterly waiting room."}),`
`]}),`
`,t.jsx(e.h2,{children:"Who It Serves Best"}),`
`,t.jsx(e.p,{children:"The model shines when a company needs something flagship—a marketing hero, product prototype, or design system that feels authored instead of assembled. Leaders who want rapid decisions, strong opinions, and a single point of contact tend to thrive in this partnership."}),`
`,t.jsx(e.p,{children:"It’s also ideal when experimentation matters. Kinetic typography, editorial layouts, intent-driven flows, or AI-native features can be explored without scary timelines because every experiment is owned end to end."}),`
`,t.jsx(e.h2,{children:"Collaboration Without Bureaucracy"}),`
`,t.jsx(e.p,{children:"“Solo” doesn’t mean isolation. Digitaltableteur pulls in trusted collaborators—writers, illustrators, ML specialists—whenever the work calls for it. The difference is orchestration. There is still one person ensuring the grid, palette, and budgets stay cohesive across every contribution."}),`
`,t.jsx(e.h2,{children:"A Studio Built on Care, Not Headcount"}),`
`,t.jsx(e.p,{children:"Growth here doesn’t mean adding layers. It means amplifying the impact of a focused practice through reusable systems, intent-driven tooling, and shared research notes. The promise stays the same: enterprise thinking, boutique-level craft, and the accountability that only comes from putting your name on every release."}),`
`,t.jsx(e.p,{children:"The future of Digitaltableteur isn’t about becoming bigger. It’s about staying sharp, staying curious, and delivering work that feels like it could only have come from one studio—because it did."})]})}function P(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(u,{...n})}):u(n)}const W=Object.freeze(Object.defineProperty({__proto__:null,default:P,frontmatter:D},Symbol.toStringTag,{value:"Module"})),B={title:"Petri Lahdelma: A Biography",slug:"petri-lahdelma-bio",publishedAt:"2025-06-15T00:00:00.000Z",readTime:"3 min read",excerpt:"From Varissuo to leading global design systems.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma"};function g(n){const e={p:"p",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Petri Lahdelma is a Finnish designer, systems thinker, and advocate for professional ethics in design. Raised in Varissuo, a suburb of Turku, his passion for visual culture came from a painter father and a supportive mother. That early spark carried him to the UK for a BA in Graphic Design at the University of Cumbria, and later to Aalto University in Helsinki for a master's degree."}),`
`,t.jsx(e.p,{children:"Among the mentors who shaped his craft were Rhiannon Robinson, who sharpened his critical eye, and Tapio Vapaasalo, who instilled a love for craftsmanship and form. After a junior stint at Werklig, Petri spent two decades moving through agencies, startups, and entrepreneurial ventures, always refusing to stand still."}),`
`,t.jsx(e.p,{children:"Today he leads a design system team in a global enterprise of more than 110,000 colleagues worldwide, balancing enterprise UX with scalable systems thinking. His portfolio ranges from national infrastructure identities like the Liikennevirasto corporate identity to agile startup brands such as New Things Company, and he laid the strategic groundwork for the Helsinki Design System."}),`
`,t.jsx(e.p,{children:"Throughout his career Petri has founded and led design guilds and special interest programs, shaping team culture as much as the work itself. He belongs to AIGA, IxDA, and ISTD. While he rarely speaks publicly—a regret of his own—his influence lives in the systems, standards, and ethics he brings to every project."}),`
`,t.jsx(e.p,{children:"He believes clarity matters more than decoration, that form follows function, and that users seldom say what they really need. Guided by curiosity and care rather than fleeting trends, colleagues know him as a thoughtful, kind collaborator who insists on doing things the right way."})]})}function F(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(g,{...n})}):g(n)}const q=Object.freeze(Object.defineProperty({__proto__:null,default:F,frontmatter:B},Symbol.toStringTag,{value:"Module"})),N={title:"Thoughts on Future Branding",slug:"thoughts-on-future-branding",publishedAt:"2018-06-07T00:00:00.000Z",readTime:"6 min read",excerpt:"Exploring branding in the age of AI and exponential design.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma",mainImageUrl:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/9460b2174dd7707b21408f68dfb03bcf63050d53-794x450.png?w=1600"};function m(n){const e={blockquote:"blockquote",img:"img",p:"p",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(e.p,{children:"Traditionally, an identity or brand has been a tool to help companies distinguish one (a product, an ideal, a set of values, or what the company does) from the other with numerous defining sub-genres and classifications, such as entry-level, iconic, luxury, etc. Usually consisting of a logo (logomark/logotype) and other graphic means designed to increase brand recognition."}),`
`,t.jsx(e.p,{children:"Brands have now adopted subtler tactics in retrospect to the early days. Brands tell stories on popular platforms—and in a subtle way that is nearly indistinguishable (advertorials) from the media readers already consume. By molding the message to the platform, brands can draw loyal customers and occasionally even make their content go viral. Tone of voice plays a big role in how brands are adopted by the masses. This encapsulates the general zeitgeist of branding today."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"Brands have now adopted subtler tactics in retrospect to the early days."}),`
`]}),`
`,t.jsx(e.p,{children:"In recent times, branding has evolved into various workflows and approaches, such as modular, responsive, interactive, or generative brand applications and corresponding identities, and vast variations of design systems to support and maintain the brand image. The craft itself has also somewhat evolved from promoting simple logomarks, and this has made the industry even more intricate."}),`
`,t.jsx(e.p,{children:"With advancements in machine learning, greater capacity for deeper neural networks (thanks to cloud solutions and Google’s efforts to speed up computing with GPUs), and especially in the field of algorithm-driven design, there’s no limit to the number of powerful tools we have access to. With the right tools and intellectual resources, we can apply the ideas garnered from the data and adapt to tomorrow's necessities, creating impactful design and successful content delivery, way “outside the box,” and soon beyond the capability of the human mind."}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/d1855849c569babe82244d83cf61a482938f278e-1000x200.webp?w=1600",alt:"."}),`
`,t.jsx("figcaption",{children:"A logotype refers to words or the name of a business that is designed or typeset."})]}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/232b37cc8479c31d1a2dd5bc9c34d56ab10ebe4c-1000x200.webp?w=1600",alt:"A collection of timeless logos."}),`
`,t.jsx("figcaption",{children:"A logomark is an identifying mark or symbol that doesn’t necessarily contain the business name."})]}),`
`,t.jsx(e.p,{children:"The technologies of tomorrow are bound to change how we design corporate identification systems and brand presence in the future. There’s no avoiding it, and the sci-fi geek in me can’t wait for news on yet another tech or gadget that will completely revolutionize the way we experience, exist, and interact."}),`
`,t.jsx(e.p,{children:"Thinking outside the box has always been the mantra of the creative industry. The truth is that more times than we’d like to admit, we’re being stuffed into that very box by our clients’ budget, our lack of vision, our fear of failure, or even sheer laziness. I’ve experienced many, if not all, possible pitfalls in my personal career as a designer, and in that sense, I am no better than my fellow designers. But where are the brands and identities that strive to do something more with the vast possibilities at our disposal today?"}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/69a7232767b490789f90493af72caebd96ea39fc-2000x1333.webp?w=1600",alt:"Programmatic logo that changes based parameters."}),`
`,t.jsx("figcaption",{children:"A philosophical brand that advocates living instinctively, responding in the moment, and letting change flow. The brand evokes this uniquely Chinese state of mind. By Wolff Olins."})]}),`
`,t.jsx(e.p,{children:"Genesis Beijing is a visual tool that explores each state and associated feeling through rich, reactive pattern. By Wolff Olins"}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/ce33d4637d29c1ad7f560cba96f96403118a9f6e-1920x1297.gif?w=1600",alt:"Ministry of Foreign Affairs Finland interactive logo"}),`
`,t.jsx("figcaption",{children:"Identity for Ministry for Foreign Affairs of Finland echoes the world events with changing color schemes. By 358"})]}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/754a86b027c0c3374e23b45a6edf2a8778de75b6-1000x511.webp?w=1600",alt:"New Things Co morphing logo."}),`
`,t.jsx("figcaption",{children:"The applications make great use of the possible variations of the globe that yields some lovely color combinations and compositions. By 358"})]}),`
`,t.jsx(e.p,{children:"An organisation that operates in a stable manner in a turbulent world and that works to make the world a better place. Video courtesy of the Ministry for Foreign Affairs of Finland and 358"}),`
`,t.jsx(e.p,{children:"By focusing on the individual experience instead of the user itself, we can easily draw out the factors that dictate how experiences are perceived. That said, we still like to pick and choose where we follow the more traditional HCD (Human-Centric Design) model, much like our own smörgåsbord for design. We validate design choices in a hive-mind manner, which is made possible by the lack of hierarchy and principles of self-governance within New Things Co."}),`
`,t.jsx(e.p,{children:"So what technologies could one consider as a designer in a branding or related project? Intelligent, algorithm-driven, reactive, or whatever the choice of tech, beneath the surface still lies an intelligent creative that understands both the given constraints and possibilities or has the capacity for evaluating machine-based output. But through matured systems of smart, tech-driven assets, these new brands will soon serve mankind a genuine, empathetic, positive, and lasting experience."}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/3451b1a6485defad0e50a90d488a88901c7cda7b-1400x463.webp?w=1600",alt:"Playful and dynamic puzzle piece logo."}),`
`,t.jsx("figcaption",{children:"Example of the New Things Co identity mutations. 2016–2018."})]}),`
`,t.jsxs(e.p,{children:[t.jsx(e.img,{src:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/49d3ffb3adfd8e7e03a51e3794d8f060d03b34ce-1400x902.webp?w=1600",alt:"Ministry of Foreign Affairs real-time status is depicted in the color of the logo."}),`
`,t.jsx("figcaption",{children:"The brandmark.io system has been trained with over 1.4 million images, instantly generating thousands of logo ideas based on user input."})]}),`
`,t.jsx(e.p,{children:"One could suggest an umbrella term “Exponentially-Driven Design” to collect all these technological advancements and bundle them to serve as an aid for design efforts. ED for short, meaning the computer-assisted, exponential advancements in the creative process. However we might call it, as creatives, we need to remember to step back and observe our habits and find smarter, new ways of working. In a word, adapt to changes in a rapidly changing digital landscape."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"“Everything should be made as simple as possible, but not simpler.”"}),`
`]}),`
`,t.jsx(e.p,{children:"— Albert Einstein"})]})}function L(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(m,{...n})}):m(n)}const O=Object.freeze(Object.defineProperty({__proto__:null,default:L,frontmatter:N},Symbol.toStringTag,{value:"Module"})),U={title:"Workflow Tips",slug:"workflow-tips",publishedAt:"2025-05-12T00:00:00.000Z",readTime:"3 min read",excerpt:"A behind-the-scenes look at how we keep projects moving.",authorName:"Petri Lahdelma",authorSlug:"petri-lahdelma",mainImageUrl:"https://cdn.sanity.io/images/ai4cwr0g/digitaltableteur-blog/ff2754d3228646d629b688b6ab7406838576d841-1536x1024.webp?w=1600"};function p(n){const e={blockquote:"blockquote",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"How to work faster, smarter, and more in sync as a designer in the age of automation and AI-enhanced tooling"}),`
`]}),`
`,t.jsx(e.p,{children:"In 2025, the gap between design and development is no longer a chasm—it’s a channel. With smarter tooling, shared metadata, and increasingly semantic design systems, teams can now collaborate in ways that are both more efficient and more meaningful. The rise of Figma’s official MCP (Metadata Component Properties) server, the normalization of token-driven design, and the integration of AI into everyday tooling means we’re not just designing screens — we’re designing systems of understanding."}),`
`,t.jsx(e.p,{children:"Whether you're a designer, developer, or someone who lives at the intersection of both, here are key workflow tips to stay effective and aligned in this rapidly evolving landscape."}),`
`,t.jsx(e.h2,{children:"Treat Your Design System Like a Product"}),`
`,t.jsx(e.p,{children:"Your design system should no longer be seen as a passive library of components—it’s an active product with its own users (developers, designers), backlog, documentation, and evolution cycle."}),`
`,t.jsx(e.h3,{children:"Robust systems in 2025 are:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"Token-first: With clear, versioned design tokens driving color, typography, spacing, and elevation."}),`
`,t.jsx(e.li,{children:"Metadata-aware: Components carry machine-readable data like intent, states, and accessibility traits via MCP."}),`
`,t.jsx(e.li,{children:"Bi-directional: Design inputs influence code output, and coded components feed back into design for parity."}),`
`]}),`
`,t.jsx(e.p,{children:"Workflow Tip:"}),`
`,t.jsx(e.p,{children:"Maintain a changelog, version your tokens, and establish governance for components just like you would APIs."}),`
`,t.jsx(e.h2,{children:"Using Figma MCP to Build a Smarter Handoff Layer"}),`
`,t.jsx(e.p,{children:"Figma’s MCP server lets you attach machine-readable context to components. Think of it as giving your design files a brain. You’re not just placing a “button”—you’re tagging it as primary, disabled, semantic:cta, and linking it to the token color-background-primary."}),`
`,t.jsx(e.p,{children:"When paired with a structured design system, this opens up a design-to-code workflow where tools and AI can assist or even auto-generate scaffolding code."}),`
`,t.jsx(e.p,{children:"Workflow Tip: Standardize naming conventions and metadata structures. Create shared guidelines on how to tag variants, behaviors, and semantic intent."}),`
`,t.jsx(e.h2,{children:"Automate the Boring Stuff — Focus on the Edges"}),`
`,t.jsx(e.p,{children:"Engineers still refine the output and designers still own the experience. But by automating the repetitive tasks—like token mapping, boilerplate scaffolding, and layout generation—you unlock time for high-value work. This means more attention to edge cases, accessibility, motion,responsive logic, and product vision. The time saved is best spent crafting delightful moments and designing inclusively—not renaming layers."}),`
`,t.jsx(e.p,{children:"Workflow Tip: Use automation for grunt work, not decision-making. Let your team spend energy on what machines can’t do well: judgment, intuition, and empathy."}),`
`,t.jsx(e.h2,{children:"Centralize Knowledge and Make It Machine-Readable"}),`
`,t.jsx(e.p,{children:"In 2025, wikis and PDFs aren’t enough."}),`
`,t.jsx(e.p,{children:"Your documentation should be:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"Atomic: Break things into tokens, components, patterns, principles"}),`
`,t.jsx(e.li,{children:"Composable: Easily remixed across tools like Storybook, Figma, Notion"}),`
`,t.jsx(e.li,{children:"Structured: Use schemas, JSON, or YAML where possible so tools can read it too"}),`
`]}),`
`,t.jsx(e.p,{children:"The more you treat your documentation like structured data instead of prose, the more future-proof and useful it becomes—especially for AI tools."}),`
`,t.jsx(e.p,{children:"Workflow Tip: Build your docs once, then publish them everywhere: Figma, Storybook, GitHub, Confluence, even AI chat interfaces."}),`
`,t.jsx(e.h2,{children:"Build a Shared Language Between Design and Dev"}),`
`,t.jsx(e.p,{children:"A design system isn’t just about buttons—it’s a communication protocol. When your tokens, components, and behaviors are named clearly and consistently, they become interoperable across people and platforms."}),`
`,t.jsx(e.p,{children:"A consistent system gives MCP data meaning. A properly named component like Card/Product/Featured combined with a token like spacing-grid-lg enables tools to generate layout logic without human interpretation."}),`
`,t.jsx(e.p,{children:"Workflow Tip: Run regular naming audits and cross-functional reviews to ensure that your naming makes sense to both humans and machines."}),`
`,t.jsx(e.h2,{children:"Final Thought: Orchestrate, Don’t Just Execute"}),`
`,t.jsx(e.p,{children:"Design and development roles are shifting from execution toward orchestration. In 2025, the real craft lies in setting up systems that can scale, adapt, and communicate across disciplines and tools. Great workflows today aren’t just fast—they’re intentional. They’re designed for clarity, for automation, and for collaboration at scale. So before you jump into the next Figma file or VSCode tab, ask yourself:"}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:'"Am I building just a component… or a conversation between design and code?"'}),`
`]})]})}function E(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(p,{...n})}):p(n)}const $=Object.freeze(Object.defineProperty({__proto__:null,default:E,frontmatter:U},Symbol.toStringTag,{value:"Module"})),z=Object.assign({"../../content/posts/design-system-meets-ai-building-the-self-evolving-component-library-pt-1.mdx":j,"../../content/posts/designing-in-2025.mdx":T,"../../content/posts/digital-craftsmanship.mdx":_,"../../content/posts/figma-mcp-design-systems.mdx":S,"../../content/posts/in-search-of-impact.mdx":W,"../../content/posts/petri-lahdelma-bio.mdx":q,"../../content/posts/thoughts-on-future-branding.mdx":O,"../../content/posts/workflow-tips.mdx":$}),X=(n,e)=>n.slug?n.slug:(e.split("/").pop()??"").replace(/\.mdx?$/,""),f=n=>{if(!n)return;const e=new Date(n);return Number.isNaN(e.getTime())?void 0:e},y=Object.entries(z).map(([n,e])=>{const s=e.frontmatter??{},o=X(s,n);return{slug:o,title:s.title??o,excerpt:s.excerpt,readTime:s.readTime,publishedAt:s.publishedAt,seoTitle:s.seoTitle,seoDescription:s.seoDescription,legacyUrl:s.legacyUrl,authorName:s.authorName,authorSlug:s.authorSlug,mainImageUrl:s.mainImageUrl,mainImageAlt:s.mainImageAlt,mainImageCaption:s.mainImageCaption,Component:e.default}}).sort((n,e)=>{const s=f(n.publishedAt)?.getTime()??0;return(f(e.publishedAt)?.getTime()??0)-s}),R=new Map(y.map(n=>[n.slug,n])),Y=()=>y,Z=n=>{if(n)return R.get(n)};export{G as M,Z as a,Y as g};
