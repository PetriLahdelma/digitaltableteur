import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import CookieConsent from "./components/CookieConsent/CookieConsent";
const Home = React.lazy(() => import("./pages/Home"));
const Work = React.lazy(() => import("./pages/Work"));
const NewThingsCo = React.lazy(() => import("./pages/work/newThingsCo"));
const Nitor = React.lazy(() => import("./pages/work/nitor"));
// Make sure the file exists at './pages/work/Illustrations.tsx' or update the path below to match the actual file name and casing.
const Illustrations = React.lazy(() => import("./pages/work/illustrations"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const UnderDevelopment = React.lazy(() => import("./pages/UnderDevelopment"));
const Blog = React.lazy(() => import("./pages/Blog"));
const Designing2025 = React.lazy(() => import("./pages/posts/Designing2025"));
const WorkflowTips = React.lazy(() => import("./pages/posts/WorkflowTips"));
const DigitalCraftsmanship = React.lazy(
  () => import("./pages/posts/DigitalCraftsmanship"),
);
const ThoughtsOnFutureBranding = React.lazy(
  () => import("./pages/posts/ThoughtsOnFutureBranding"),
);
const FigmaMCP = React.lazy(() => import("./pages/posts/FigmaMCP"));
const PetriLahdelmaBio = React.lazy(
  () => import("./pages/posts/PetriLahdelmaBio"),
);
const NotFound = React.lazy(() => import("./pages/NotFound"));

const CookiePolicyFullEN = React.lazy(
  () => import("./pages/CookiePolicy-full-en"),
);
const CookiePolicyFullFI = React.lazy(
  () => import("./pages/CookiePolicy-full-fi"),
);
const CookiePolicyFullSV = React.lazy(
  () => import("./pages/CookiePolicy-full-sv"),
);

const SECRET_PARAM = "preview";
const SECRET_VALUE = "letmein"; // Change this to your own secret

function isBypass() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(SECRET_PARAM) === SECRET_VALUE;
}

function App() {
  // if (!isBypass()) {
  //   return <UnderDevelopment />;
  // }

  return (
    <Router>
      <div>
        <CookieConsent />
        <Suspense
          fallback={
            <div
              style={{ fontSize: "1rem", fontFamily: "Moderat, sans-serif" }}
            >
              Loading...
            </div>
          }
        >
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route
                path="/blog/designing-in-2025"
                element={<Designing2025 />}
              />
              <Route path="/blog/workflow-tips" element={<WorkflowTips />} />
              <Route
                path="/blog/digital-craftsmanship"
                element={<DigitalCraftsmanship />}
              />
              <Route
                path="/blog/thoughts-on-future-branding"
                element={<ThoughtsOnFutureBranding />}
              />
              <Route
                path="/blog/figma-mcp-design-systems"
                element={<FigmaMCP />}
              />
              <Route
                path="/blog/petri-lahdelma-bio"
                element={<PetriLahdelmaBio />}
              />
              {/* Cookie Policy Full routes for all languages */}
              <Route
                path="/cookie-policy-full-en"
                element={<CookiePolicyFullEN />}
              />
              <Route
                path="/cookie-policy-full-fi"
                element={<CookiePolicyFullFI />}
              />
              <Route
                path="/cookie-policy-full-sv"
                element={<CookiePolicyFullSV />}
              />
              {/* Optionally, make /cookie-policy-full default to EN */}
              <Route
                path="/cookie-policy-full"
                element={<CookiePolicyFullEN />}
              />
              <Route path="/work/new-things-co" element={<NewThingsCo />} />
              <Route path="/work/nitor" element={<Nitor />} />
              <Route path="/work/illustrations" element={<Illustrations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
