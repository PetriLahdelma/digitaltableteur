import React from "react";
import { Helmet } from "react-helmet";
import styles from "./Blog.module.css";
import { posts } from "./posts";
import ArticleCard from "../components/ArticleCard/ArticleCard";

interface Post {
  title: string;
  lead: string;
  link: string;
  readTime: string;
  color: string;
  date: string;
  component: React.FC;
}

const Blog = () => {
  const sortedPosts = posts.sort((a: Post, b: Post) => {
    const dateA = new Date(a.date.split(".").reverse().join("-"));
    const dateB = new Date(b.date.split(".").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      <Helmet>
        <title>Blog | Digitaltableteur</title>
        <meta
          name="description"
          content="Insights and articles from the Digitaltableteur team"
        />
      </Helmet>
      <div className={styles.blog}>
        <h1>Articles</h1>
        <div className={styles.list}>
          {sortedPosts.map((post: Post) => (
            <ArticleCard
              key={post.link}
              title={post.title}
              lead={post.lead}
              link={post.link}
              readTime={post.readTime}
              colorClass={post.color}
              className={styles.card}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
