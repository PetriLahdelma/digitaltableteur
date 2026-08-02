"use client";

import React from "react";
import { ProcessBlock, Text } from "@digitaltableteur/react";
import TeamBlock from "../../../../patterns/TeamBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import Image from "next/image";
import {
  SiSlack,
  SiFigma,
  SiSketch,
} from "react-icons/si";

// New patterns from Phase 08-2
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { AdobeToolIcon } from "../AdobeToolIcon";

export function HelsinkiDesignSystemPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("helsinki-design-system");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description="Design system for the City of Helsinki: research, process, components, and impact across multivendor services."
          image={{
            src: "/images/portfolio/helsinki-design-system/helsinki_hero.png",
            alt: "Helsinki Design System",
            width: 1200,
            height: 600,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
    >
      {/* Project metadata */}
      <ProjectMetaSection
        services={[
          "UX Design",
          "UI Design",
          "Service Design",
          "Design System",
          "Frontend Development",
          "Documentation",
        ]}
        duration="Jan 2020 – Mar 2022"
        tools={[
          {
            key: "slack",
            icon: <SiSlack size={24} />,
            name: "Slack",
          },
          {
            key: "figma",
            icon: <SiFigma size={24} />,
            name: "Figma",
          },
          {
            key: "sketch",
            icon: <SiSketch size={24} />,
            name: "Sketch",
          },
          {
            key: "illustrator",
            icon: <AdobeToolIcon tool="illustrator" />,
            name: "Illustrator",
          },
          {
            key: "photoshop",
            icon: <AdobeToolIcon tool="photoshop" />,
            name: "Photoshop",
          },
        ]}
        team={[
          {
            name: "Laura Karhu",
            role: "Project Lead (PM/PO)",
            image: "/images/portfolio/helsinki-design-system/team/laura.png",
          },
          {
            name: "Petri Lahdelma",
            role: "Senior UX Designer",
            image: "/images/portfolio/helsinki-design-system/team/petri.png",
          },
          {
            name: "Roni Helppi",
            role: "UX Designer",
            image: "/images/portfolio/helsinki-design-system/team/roni.png",
          },
          {
            name: "Mika Nevalainen",
            role: "Senior Software Developer",
            image: "/images/portfolio/helsinki-design-system/team/mika.png",
          },
          {
            name: "Ville Miekk'oja",
            role: "Freelance Consultant",
            image: "/images/portfolio/helsinki-design-system/team/ville.png",
          },
        ]}
        overview={
          <Text size="s">
            <span style={{ fontWeight: 600 }}>The city of Helsinki</span> offers
            hundreds or thousands of disparate digital services, from daycare
            applications to cultural services, public health booking to job
            services. Without a unified design system, each service risked
            looking, behaving, and functioning completely differently, leading
            to user confusion and inconsistent experience.
            <br /> <br />
            <span style={{ fontWeight: 600 }}>The goal:</span> In a multivendor
            environment, to provide a shared toolbox and design foundation so
            that all services offered by the city share a consistent visual
            identity, accessible UI, and predictable, high-quality user
            experience.
          </Text>
        }
        background="muted"
      />

      {/* Process phases */}
      <ProcessBlock
        phases={[
          {
            title: "Discover",
            activities: [
              "Stakeholder Workshops",
              "Contextual Inquiry",
              "User Research",
              "User Interviews",
              "Benchmark Analysis",
              "Brand Application and Restrictions",
            ],
          },
          {
            title: "Define",
            activities: [
              "User Personas",
              "Empathy Map",
              "User Journey Mapping",
              "Accessibility",
              "CI/CD process",
              "Information Architecture",
              "Definition of Done",
            ],
          },
          {
            title: "Ideate",
            activities: [
              "User Flows",
              "Component Structures",
              "Accessibility and inclusivity guidelines",
              "Sync with stakeholders",
              "User Research",
              "Wireframes",
              "Prototypes",
            ],
          },
          {
            title: "Design",
            activities: [
              "Reusable Components",
              "Token base",
              "Patterns and templates",
              "Accessibility Reviews",
              "Documentation",
              "Design Reviews",
              "Feedback Loops",
              "Maintenance",
            ],
          },
        ]}
        sectionTitle="Process"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      {/* Discovery Process: Research and Analysis */}
      <StoryBlock
        subtitle="Discovery Process"
        title="Research and Analysis"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              The initial phase of the Helsinki Design System
            </span>{" "}
            focused on establishing a deep understanding of the city&apos;s
            diverse digital ecosystem, service users, and organisational needs.
            This involved extensive stakeholder interviews across municipal
            departments, design and development teams, and service owners to map
            existing workflows, challenges, and inconsistencies in current
            digital services. Parallel to this, user research was conducted with
            Helsinki residents, including accessibility-focused studies with
            users of varying ages, linguistic backgrounds, and functional
            abilities, ensuring the system reflects the city&apos;s commitment
            to inclusivity and equality.
          </Text>,
          <Text key="2" size="s">
            Audits of existing digital services are performed to identify
            fragmentation, redundant patterns, visual inconsistencies, and
            usability gaps. Benchmarking against other public sector design
            systems (such as GOV.UK and similar Nordic counterparts) helped
            evaluate best practices and opportunities for innovation. Technical
            analysis covers platform requirements, component scalability,
            performance considerations, and integration needs within the
            city&apos;s digital infrastructure.
          </Text>,
          <Text key="3" size="s">
            This phase culminated in discovering core design principles, with
            the brand design agency Werklig, rooted in transparency,
            accessibility, trust, and usability, as well as identifying
            standardised components, interaction patterns, and visual
            guidelines. The insights gathered informed the foundation of HDS,
            ensuring it enables consistent, accessible, and user-centric digital
            experiences while supporting efficient collaboration across
            Helsinki&apos;s numerous service teams.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/helsinki-design-system/research.png",
            alt: "Helsinki Design System journey map",
            width: 738,
            height: 506,
            caption: "Post-it Findings",
          },
          {
            src: "/images/portfolio/helsinki-design-system/goal-setting.png",
            alt: "Helsinki Design System prototype detail",
            width: 738,
            height: 506,
            caption: "Benchmarking and goal-setting.",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Discovery Process: Personas and Journey Mapping */}
      <StoryBlock
        subtitle="Discovery Process"
        title="Personas and Journey Mapping"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              Building on the insights gathered during the research phase
            </span>
            , the Helsinki Design System Team developed a set of representative
            personas that reflect the diverse spectrum of people interacting
            with the city&apos;s digital services. These personas encapsulated
            varying levels of digital literacy, language preferences,
            accessibility needs, and life situations, such as elderly residents
            managing essential services, parents accessing childcare
            information, international newcomers navigating municipal processes
            and city employees operating internal systems. Each persona
            highlighted distinct motivations, behavioural patterns, and friction
            points, enabling design and development teams to ground their
            decisions in real-world contexts rather than assumptions.
          </Text>,
          <Text key="2" size="s">
            Journey mapping was then used to visualise how these personas engage
            with Helsinki&apos;s digital services across different touch points
            and channels. From discovering a service through the city portal, to
            completing tasks such as discovering services, booking appointments,
            or accessing social services, the journeys illustrate the complete
            interaction flow and emotional states of users at each stage. This
            process uncovered usability gaps, moments of confusion and potential
            accessibility barriers, while also highlighting opportunities to
            simplify navigation, improve clarity, and reduce cognitive load.
          </Text>,
          <Text key="3" size="s">
            These personas and journey maps directly informed the structure and
            prioritisation of HDS components and patterns. By aligning design
            decisions with concrete user journeys, the design system ensured
            that interfaces remain intuitive, inclusive, and consistent across
            services, supporting seamless experiences for all users regardless
            of their background or abilities.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/helsinki-design-system/journey-map.png",
            alt: "Workshop participants creating user personas with sticky notes on a wall",
            width: 738,
            height: 506,
            caption: "Persona Creation Illustration",
          },
          {
            src: "/images/portfolio/helsinki-design-system/prototype-detail.png",
            alt: "Design team collaborating on user journey mapping during a workshop session",
            width: 738,
            height: 506,
            caption: "Journey Mapping at a Design System Workshop.",
          },
        ]}
        imageLayout="grid"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Discovery Process: Ideation and Concept Development */}
      <StoryBlock
        subtitle="Discovery Process"
        title="Ideation and Concept Development"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              During the ideation and concept development phase
            </span>
            , multidisciplinary workshops and collaborative sessions were
            facilitated with designers, developers, service owners, and
            accessibility specialists to explore how the Helsinki Design System
            can best support the city&apos;s wide range of digital services.
            These sessions focused on translating research insights and user
            needs into practical design system concepts, emphasizing
            consistency, flexibility, and long-term scalability. All
            participants had the chance to collaboratively help define how core
            elements such as typography, colour systems, layout structures, and
            interaction patterns should function across multiple platforms and
            service contexts.
          </Text>,
          <Text key="2" size="s">
            Design thinking methodologies were central to this phase, with
            structured ideation exercises encouraging teams to challenge
            existing conventions and rethink how public services can be
            delivered digitally. Rapid concept sketching, pattern exploration,
            and co-creation workshops generate a diverse range of potential
            solutions, from modular component structures and responsive grid
            systems to accessible navigation patterns and inclusive content
            guidance. These activities allowed the team to test different visual
            and functional directions without committing to a single rigid
            approach too early.
          </Text>,
          <Text key="3" size="s">
            The outcome of this phase was a clearly articulated design vision
            for HDS, supported by conceptual models, preliminary component
            frameworks, and defined design principles. These concepts
            established a shared understanding across teams and serve as the
            foundation for prototyping, ensuring the system balances aesthetic
            cohesion, usability, and practical implementation needs across
            Helsinki&apos;s digital service landscape.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/helsinki-design-system/component-structure.png",
          alt: "Flowchart diagram showing the component contribution process and approval workflow",
          width: 3934,
          height: 1816,
          caption: "Contribution Flowchart",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Design Process: Low-Fidelity Wireframing */}
      <StoryBlock
        subtitle="Design Process"
        title="Low-Fidelity Wireframing"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              Leveraging the insights from research{" "}
            </span>
            personas, and concept development, the Helsinki Design System team
            translated strategic decisions into low-fidelity wireframes that
            define the foundational layout and structural logic of the system.
            These wireframes focused on mapping core interface elements such as
            navigation hierarchies, content regions, component placement, and
            interaction zones, without the distraction of visual styling or
            branding details. This approach allowed the team to validate
            structural clarity, usability, and scalability at an early stage.
          </Text>,
          <Text key="2" size="s">
            The wireframes illustrated how key HDS components and patterns
            function within real service contexts, including layout templates
            for service pages, form flows, dashboards, and navigation systems.
            By outlining user pathways and content prioritisation, the team
            ensured that layouts support clear information flow, efficient task
            completion, and accessibility requirements such as legibility,
            logical focus order and consistent interaction patterns.
          </Text>,
          <Text key="3" size="s">
            These low-fidelity wireframes acted as a blueprint for both design
            and development teams, aligning stakeholders around shared
            structural standards before high-fidelity design and UI development
            began. They enable rapid iteration and feedback, helping to refine
            the system&apos;s architecture and user experience while reinforcing
            the principles of consistency, inclusivity, and usability across
            Helsinki&apos;s digital services.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/helsinki-design-system/wireframes.png",
          alt: "Low-fidelity wireframes showing frontpage layout and information architecture",
          width: 1204,
          height: 538,
          caption: "Early Frontpage and Information Architecture Wireframes",
          mixBlendMode: "multiply",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Design Process: Iterative Prototyping and User Testing */}
      <StoryBlock
        subtitle="Design Process"
        title="Iterative Prototyping and User Testing"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              High-fidelity prototypes for communicating design decisions{" "}
            </span>
            were developed using design tools like Figma and Sketch. The
            prototypes showcased the app&apos;s visual design, interaction
            patterns and transitions. User testing sessions were conducted,
            allowing participants to navigate through the prototype and provide
            feedback on usability, clarity, and the overall user experience.
            Iterations and refinements were made based on the feedback received
            to improve design, eliminate pain points, and enhance user
            satisfaction.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Design Process: Continuous Delivery & Design Deliverables */}
      <StoryBlock
        subtitle="Design Process"
        title="Continuous Delivery & Design Deliverables"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              The iterative component creation process{" "}
            </span>
            within the Helsinki Design System was built on a close feedback loop
            between design and development, ensuring that each component evolves
            through real-world usage rather than theoretical perfection.
            Components were first conceptualised and prototyped in design tools,
            then progressively refined in Storybook through prop management,
            testing, peer reviews, and pilot implementations across selected
            city services. This cyclical approach allowed the team to validate
            usability, accessibility, and technical feasibility early, ensuring
            that components remain practical, adaptable, and aligned with the
            needs of multiple departments and service contexts.
          </Text>,
          <Text key="2" size="s">
            The continuous delivery pipeline supported this iterative model,
            enabling the HDS team to release updates frequently and reliably.
            Updates were also delivered on the design front. Each new version
            bump consisted of deliverables: codebase in various versions,
            designs, assets and documentation. Components are versioned and
            documented in a central repository, with automated testing ensuring
            compliance with accessibility standards (WCAG), visual consistency,
            and responsive behaviour and the outcomes were reviewed by 3rd party
            accessibility experts regularly. Design updates and code
            implementations were synchronised through versioning NPM packages
            and shared workflows, reducing the risk of divergence between design
            libraries and production components. This pipeline ensured that
            improvements, fixes, and enhancements could be deployed without
            disrupting live services, reinforcing confidence in the
            system&apos;s stability and governance.
          </Text>,
          <Image
            key="inline-image"
            src="/images/portfolio/helsinki-design-system/hds-structure.png"
            alt="Diagram showing HDS development deliverables structure including code, design, and documentation layers"
            width={677}
            height={282}
            style={{
              width: "100%",
              height: "auto",
              marginBlock: "2rem",
              marginBlockEnd: "0",
            }}
          />,
          <Text
            key="caption"
            size="xs"
            style={{
              fontStyle: "italic",
              textAlign: "center",
              marginBlockStart: "2rem",
              marginBlockEnd: "2rem",
            }}
          >
            HDS Dev Deliverables
          </Text>,
          <Text key="3" size="s">
            <span style={{ fontWeight: 600 }}>
              Several obstacles had to be addressed{" "}
            </span>
            to make this approach successful. One key challenge was aligning
            cross-departmental stakeholders and overcoming e.g. inconsistent
            adoption practices, as different teams initially maintained their
            own design variations. This was solved through clear co-governance
            models, contribution guidelines and structured onboarding processes
            that encouraged teams to adopt and contribute to HDS
            collaboratively. Another challenge involved balancing long-term
            consistency with the need for rapid innovation. The team addressed
            this by introducing advanced version control, deprecation
            strategies, and experimental component phases, allowing new ideas to
            be tested before full integration.
          </Text>,
          <Text key="4" size="s">
            Through this disciplined yet flexible approach, the Helsinki Design
            System team established a scalable, living system that continuously
            adapts to evolving service requirements while maintaining coherence,
            accessibility, and high design quality across Helsinki&apos;s
            digital ecosystem to this day.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/helsinki-design-system/components-page.png",
          alt: "Screenshot of the Helsinki Design System components documentation page showing component library and guidelines",
          width: 1184,
          height: 500,
          caption: "The Helsinki Design System Components Page",
          mixBlendMode: "multiply",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Implementation showcase grid */}
      <GridBlock
        columns={2}
        gap="none"
        maxWidth="md"
        spacing="comfortable"
        backgroundColor="transparent"
        cells={[
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">Implementation for Mobile</Text>
                <Text size="s">
                  On mobile, HDS ensures that patterns remain consistent and
                  intuitive, regardless of screen size or context of use.
                  Designers and developers rely on its predefined components and
                  responsive guidelines to create interfaces that feel familiar,
                  trustworthy, and easy to navigate on all devices, supporting
                  users in real-life situations where clarity is essential.
                </Text>
              </>
            ),
          },
          {
            type: "image",
            src: "/images/portfolio/helsinki-design-system/phonemock.png",
            alt: "Helsinki Design System mobile implementation",
            width: 1184,
            height: 500,
            mixBlendMode: "multiply",
            caption: "Helsinki Design System mobile implementation",
          },
          {
            type: "image",
            src: "/images/portfolio/helsinki-design-system/lappymock.png",
            alt: "Helsinki Design System laptop implementation",
            width: 1184,
            height: 500,
            mixBlendMode: "multiply",
            caption: "Helsinki Design System laptop implementation",
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">
                  HDS in the every day lives of the Helsinki people
                </Text>
                <Text size="s">
                  The Helsinki Design System plays a foundational role when
                  integrated into digital infrastructures, ensuring that
                  services remain consistent and beautifully designed. Its
                  components, accessibility guidelines, and rigorously tested
                  patterns help maintain stability across systems where
                  reliability is non-negotiable.
                </Text>
              </>
            ),
          },
        ]}
      />

      {/* Conclusion */}
      <StoryBlock
        subtitle="Design Process"
        title="Conclusion"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>The Helsinki Design System </span>
            represents a comprehensive, user-centred effort to unify and elevate
            the quality of digital services across the City of Helsinki. Through
            rigorous research, collaborative ideation, wireframing and an
            iterative component development pipeline, HDS establishes a
            foundation that is both accessible and scalable. The system enables
            teams throughout the city to build services that are consistent,
            intuitive, and aligned with Helsinki's values of equality,
            transparency, and inclusion.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />
    </ProjectDetailLayout>
  );
}
