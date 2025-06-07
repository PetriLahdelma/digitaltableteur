import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UnderDevelopment from "./pages/UnderDevelopment";
import Blog from "./pages/Blog";
import Designing2025 from "./pages/Designing2025";
import WorkflowTips from "./pages/WorkflowTips";
import DigitalCraftsmanship from "./pages/DigitalCraftsmanship";

function App() {
  return (
    <Router>
      <div>
        <UnderDevelopment />
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
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
