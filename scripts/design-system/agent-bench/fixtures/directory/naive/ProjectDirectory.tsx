"use client";

import { useState } from "react";
import { projects } from "./projects";

// Plausible first attempt: filters and pages correctly in isolation, but a new
// filter keeps the old page (empty page 3 of a 2-page result), the count is not
// a live region, and chips do not expose their pressed state.
export default function ProjectDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const results = projects.filter(
    (project) =>
      (category === "All" || project.category === category) &&
      project.name.toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.ceil(results.length / 5);
  return (
    <section>
      <input
        type="search"
        aria-label="Search projects"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {["All", "Design", "Engineering", "Research"].map((name) => (
        <button key={name} type="button" onClick={() => setCategory(name)}>
          {name}
        </button>
      ))}
      <p>{results.length} projects</p>
      <ul aria-label="Projects">
        {results.slice((page - 1) * 5, page * 5).map((project) => (
          <li key={project.name}>{project.name}</li>
        ))}
      </ul>
      <nav>
        {Array.from({ length: pages }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Page ${index + 1}`}
            aria-current={page === index + 1 ? "page" : undefined}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </nav>
    </section>
  );
}
