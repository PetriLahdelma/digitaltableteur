"use client";

import { useMemo, useState } from "react";
import { FilterChip } from "@dt/FilterChip";
import { Pagination } from "@dt/Pagination";
import { projects } from "./projects";

const CATEGORIES = ["All", "Design", "Engineering", "Research"] as const;
const PAGE_SIZE = 5;

export default function ProjectDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [page, setPage] = useState(1);

  const results = useMemo(
    () =>
      projects.filter(
        (project) =>
          (category === "All" || project.category === category) &&
          project.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section>
      <label htmlFor="project-search">Search projects</label>
      <input
        id="project-search"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />
      <div role="group" aria-label="Category">
        {CATEGORIES.map((name) => (
          <FilterChip
            key={name}
            pressed={category === name}
            onClick={() => {
              setCategory(name);
              setPage(1);
            }}
          >
            {name}
          </FilterChip>
        ))}
      </div>
      <p role="status">
        {results.length} {results.length === 1 ? "project" : "projects"}
      </p>
      {results.length === 0 ? (
        <p>No projects match your filters</p>
      ) : (
        <>
          <ul aria-label="Projects">
            {visible.map((project) => (
              <li key={project.name}>
                {project.name} ({project.category})
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
