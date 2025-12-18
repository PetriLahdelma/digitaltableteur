import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { AuthorPage } from "../../shared/components/pages/Blog";
import { getAuthorBySlug } from "../data/authors";

const AuthorProfile: React.FC = () => {
  const { slug } = useParams();
  const author = getAuthorBySlug(slug ?? "");

  if (!author) {
    return <Navigate to="/not-found" replace />;
  }

  const metaTitle = `${author.name} | Digitaltableteur`;
  const metaDescription =
    author.bio?.slice(0, 160) ||
    "Learn more about this Digitaltableteur author.";

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          {author.imageUrl && (
            <meta property="og:image" content={author.imageUrl} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTitle} />
          <meta name="twitter:description" content={metaDescription} />
          {author.imageUrl && (
            <meta name="twitter:image" content={author.imageUrl} />
          )}
        </Helmet>
        <AuthorPage slug={author.slug} />
      </>
    </HelmetProvider>
  );
};

export default AuthorProfile;
