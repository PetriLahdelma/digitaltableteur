import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProgressMessage from "./components/ProgressMessage";

function App() {
  return (
    <Router>
      <Layout>
        {process.env.REACT_APP_SHOW_PROGRESS_MESSAGE === "true" && (
          <ProgressMessage />
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;