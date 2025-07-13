import createMDX from '@next/mdx';

const withMDX = createMDX({ extension: /\.mdx?$/ });

const nextConfig = {
  images: {
    domains: [],
  },
  output: 'export',
  pageExtensions: ['tsx', 'ts', 'mdx'],
};

export default withMDX(nextConfig);
