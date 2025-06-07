import styles from "./Blog.module.css";

interface Post {
  title: string;
  lead: string;
  link: string;
  readTime: string;
  color: string;
}

const posts: Post[] = [
  {
    title: "Designing in 2025: Navigating the AI-Assisted Creative Landscape",
    lead: "After more than two decades in the design field, we’re exploring how AI partners with creativity.",
    link: "/blog/designing-in-2025",
    readTime: "5 min read",
    color: styles.pink,
  },
  {
    title: "Workflow Tips",
    lead: "A behind-the-scenes look at how we keep projects moving.",
    link: "/blog/workflow-tips",
    readTime: "3 min read",
    color: styles.teal,
  },
  {
    title: "Digital Craftsmanship",
    lead: "Thoughts on maintaining quality in a hurry-up culture.",
    link: "/blog/digital-craftsmanship",
    readTime: "4 min read",
    color: styles.purple,
  },
];

const Blog = () => {
  return (
    <div className={styles.blog}>
      <h1>Blog</h1>
      <div className={styles.list}>
        {posts.map((post) => (
          <a key={post.link} href={post.link} className={`${styles.card} ${post.color}`}> 
            <h2 className={styles.title}>{post.title}</h2>
            <p className={styles.lead}>{post.lead}</p>
            <div className={styles.meta}>
              <span className={styles.readTime}>{post.readTime}</span>
              <span className={styles.readMore}>Read</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Blog;
