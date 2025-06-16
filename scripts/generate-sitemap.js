const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://digitaltableteur.com';
const ROUTES = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/work',
  '/cookie-policy',
  '/privacy-policy',
];
const PRIORITY = {
  '/': '1.0',
  '/about': '0.8',
  '/contact': '0.8',
  '/blog': '0.8',
  '/work': '0.8',
  '/cookie-policy': '0.5',
  '/privacy-policy': '0.5',
};
const CHANGEFREQ = {
  '/': 'daily',
  '/about': 'monthly',
  '/contact': 'monthly',
  '/blog': 'weekly',
  '/work': 'monthly',
  '/cookie-policy': 'yearly',
  '/privacy-policy': 'yearly',
};

const today = new Date().toISOString().slice(0, 10);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTES.map(route => `  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${CHANGEFREQ[route]}</changefreq>\n    <priority>${PRIORITY[route]}</priority>\n  </url>`),
  '</urlset>'
].join('\n');

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml);
console.log('sitemap.xml generated.');
