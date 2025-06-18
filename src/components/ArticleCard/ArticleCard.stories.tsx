import React from "react";
import ArticleCard from "./ArticleCard";

export default {
  title: "Components/ArticleCard",
  component: ArticleCard,
};

export const Default = () => (
  <ArticleCard
    title="How to Build a Design System"
    lead="A practical guide to building and scaling a design system for modern teams."
    link="/blog/design-system-guide"
    readTime="5 min read"
    colorClass="teal"
  />
);

export const WithCustomClass = () => (
  <ArticleCard
    title="Branding in 2025"
    lead="What the future holds for digital branding and identity."
    link="/blog/branding-2025"
    readTime="7 min read"
    colorClass="purple"
    className="custom-class"
  />
);
