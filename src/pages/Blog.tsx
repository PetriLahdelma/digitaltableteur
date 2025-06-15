import React from "react";
import { Helmet } from "react-helmet";
import styles from "./Blog.module.css";
import { posts } from "./posts";

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
            <a
              key={post.link}
              href={post.link}
              className={`${styles.card} ${post.color}`}
            >
              <h2 className={styles.title}>{post.title}</h2>
              <p className={styles.lead}>{post.lead}</p>
              <div className={styles.meta}>
                <span className={styles.readTime}>{post.readTime}</span>
                <span className={styles["read-more"]}>Read more</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
