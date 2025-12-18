import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { WorkIndexPage } from "../../shared/components/pages/Work/WorkIndex";

const Work = () => {
  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>Work | Digitaltableteur</title>
          <meta
            name="description"
            content="Selected projects and experiments by Digitaltableteur"
          />
          <meta property="og:title" content="Work | Digitaltableteur" />
          <meta
            property="og:description"
            content="Selected projects and experiments by Digitaltableteur"
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Work | Digitaltableteur" />
          <meta
            name="twitter:description"
            content="Selected projects and experiments by Digitaltableteur"
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <WorkIndexPage />
      </>
    </HelmetProvider>
  );
};

export default Work;
