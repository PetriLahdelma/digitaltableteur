# Sanity Blogging Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- Check out the example frontend: [React/Next.js](https://github.com/sanity-io/tutorial-sanity-blog-react-next)
- [Read the blog post about this template](https://www.sanity.io/blog/build-your-own-blog-with-sanity-and-next-js?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)

## Blog Manifest Integration

The Next.js app consumes a build-time blog manifest at `nextjs-app/shared/data/blogManifest.ts` to surface articles.

- The manifest is auto-generated before **build** (`prebuild`). After editing MDX locally, run `npm run generate:blog` or `npm run dev:full`.
- The root `scripts/publish-from-sanity.sh` triggers manifest regeneration after syncing content.
- If articles don’t appear, run `node scripts/generate-blog-manifest.mjs` from the root repo or restart the dev server.
