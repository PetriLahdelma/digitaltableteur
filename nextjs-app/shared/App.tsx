import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@dt/Layout";
import CookieConsent from "@dt/CookieConsent";
import ChunkErrorBoundary from "@dt/ChunkErrorBoundary";
import { useTranslation } from "react-i18next";
import i18n from "./i18n"; // Import i18n instance directly
import { BusyIndicator, AppLoading } from "./components";

const Home = React.lazy(() => import("./vite-pages/Home"));
const Work = React.lazy(() => import("./vite-pages/Work"));
// const HelsinkiDesignSystem = React.lazy(
//   () => import("./vite-pages/work/helsinkiDesignSystem"),
// );
const NewThingsCo = React.lazy(() => import("./vite-pages/work/newThingsCo"));
const Illustrations = React.lazy(
  () => import("./vite-pages/work/illustrations"),
);
const GarageJunction = React.lazy(
  () => import("./vite-pages/work/garageJunction"),
);
const About = React.lazy(() => import("./vite-pages/About"));
const Contact = React.lazy(() => import("./vite-pages/Contact"));
const Blog = React.lazy(() => import("./vite-pages/Blog"));
const BlogArticle = React.lazy(() => import("./vite-pages/BlogArticle"));
const AuthorProfile = React.lazy(() => import("./vite-pages/AuthorProfile"));
const NotFound = React.lazy(() => import("./vite-pages/NotFound"));
const AiUsage = React.lazy(() => import("./vite-pages/AiUsage"));

const CookiePolicyFullEN = React.lazy(
  () => import("./vite-pages/CookiePolicy-full-en"),
);
const CookiePolicyFullFI = React.lazy(
  () => import("./vite-pages/CookiePolicy-full-fi"),
);
const CookiePolicyFullSV = React.lazy(
  () => import("./vite-pages/CookiePolicy-full-sv"),
);

function App() {
  useTranslation(); // Keep this for React component updates
  useEffect(() => {
    const storedLang =
      localStorage.getItem("lang") ||
      (typeof window !== "undefined" &&
        document.cookie.match(/i18next=([a-zA-Z-]+)/)?.[1]);
    if (
      storedLang &&
      i18n.language !== storedLang &&
      typeof i18n.changeLanguage === "function"
    ) {
      i18n.changeLanguage(storedLang);
    }
  }, []);

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
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/blog/authors/:slug" element={<AuthorProfile />} />
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
                {/* <Route
                  path="/work/helsinki-design-system"
                  element={<HelsinkiDesignSystem />}
                /> */}
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
