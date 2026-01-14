"use client";

import React from "react";
import { BlogIndexContent } from "../../../patterns/BlogIndexContent";

export function BlogPage() {
  return (
    <BlogIndexContent
      showHero
      heroVariant="compact"
      showFilter
      filterVariant="pills"
      showPagination
      gridLayout="standard"
      postsPerPage={9}
    />
  );
}
