const fs = require('fs');
const https = require('https');

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY || 'd8nFs8A5KcjbFr6KkwZV4H5K';

if (!token) {
  console.error('Missing FIGMA_TOKEN environment variable');
  process.exit(1);
}

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}`,
  method: 'GET',
  headers: { 'X-Figma-Token': token },
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => (data += chunk));
  res.on('end', () => {
    fs.writeFileSync('figma.json', data);
    console.log('Saved figma.json');
  });
});

req.on('error', err => {
  console.error(err);
  process.exit(1);
});

req.end();
