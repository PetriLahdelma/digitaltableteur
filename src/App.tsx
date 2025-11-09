import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@dt/Layout";
import CookieConsent from "@dt/CookieConsent";
import ChunkErrorBoundary from "@dt/ChunkErrorBoundary";
import { useTranslation } from "react-i18next";
import { BusyIndicator, AppLoading } from "./components";

const Home = React.lazy(() => import("./pages/Home"));
const Work = React.lazy(() => import("./pages/Work"));
const NewThingsCo = React.lazy(() => import("./pages/work/newThingsCo"));
const Illustrations = React.lazy(() => import("./pages/work/illustrations"));
const GarageJunction = React.lazy(() => import("./pages/work/garageJunction"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Blog = React.lazy(() => import("./pages/Blog"));
const Designing2025 = React.lazy(() => import("./pages/posts/Designing2025"));
const InSearchOfImpact = React.lazy(
  () => import("./pages/posts/InSearchOfImpact"),
);
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
const AiUsage = React.lazy(() => import("./pages/AiUsage"));

const CookiePolicyFullEN = React.lazy(
  () => import("./pages/CookiePolicy-full-en"),
);
const CookiePolicyFullFI = React.lazy(
  () => import("./pages/CookiePolicy-full-fi"),
);
const CookiePolicyFullSV = React.lazy(
  () => import("./pages/CookiePolicy-full-sv"),
);

function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const storedLang =
      localStorage.getItem("lang") ||
      (typeof window !== "undefined" &&
        document.cookie.match(/i18next=([a-zA-Z-]+)/)?.[1]);
    if (storedLang && i18n.language !== storedLang) {
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);

  return (
    <ChunkErrorBoundary>
      <Router>
        <div>
          <CookieConsent />
          <Suspense fallback={<AppLoading />}>
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
                <Route
                  path="/blog/in-search-of-impact"
                  element={<InSearchOfImpact />}
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
                <Route path="/ai-use" element={<AiUsage />} />
                <Route path="/work/new-things-co" element={<NewThingsCo />} />
                <Route path="/work/illustrations" element={<Illustrations />} />
                <Route
                  path="/work/garage-junction"
                  element={<GarageJunction />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Suspense>
        </div>
      </Router>
    </ChunkErrorBoundary>
  );
}

export default App;
