import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UnderDevelopment from "./pages/UnderDevelopment";
import Blog from "./pages/Blog";
import Designing2025 from "./pages/posts/Designing2025";
import WorkflowTips from "./pages/posts/WorkflowTips";
import DigitalCraftsmanship from "./pages/posts/DigitalCraftsmanship";
import NotFound from "./pages/NotFound";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import ThoughtsOnFutureBranding from "./pages/posts/ThoughtsOnFutureBranding";

function App() {
  return (
    <Router>
      <div>
        <UnderDevelopment />
        <CookieConsent />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/designing-in-2025" element={<Designing2025 />} />
            <Route path="/blog/workflow-tips" element={<WorkflowTips />} />
            <Route
              path="/blog/digital-craftsmanship"
              element={<DigitalCraftsmanship />}
            />
            <Route
              path="/blog/thoughts-on-future-branding"
              element={<ThoughtsOnFutureBranding />}
            />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
