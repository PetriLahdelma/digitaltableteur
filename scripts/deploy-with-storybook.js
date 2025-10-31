#!/usr/bin/env node

/**
 * Deploy script that builds both the main site and Storybook,
 * then deploys them together to GitHub Pages
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function deployWithStorybook() {
  try {
    console.log('🏗️  Building main site...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('📚 Building Storybook...');
    execSync('npm run build-storybook', { stdio: 'inherit' });

    console.log('📁 Moving Storybook to subdirectory...');
    const distDir = path.join(__dirname, '..', 'dist');
    const storybookDir = path.join(distDir, 'storybook');
    const storybookBuildDir = path.join(__dirname, '..', 'storybook-static');

    // Ensure dist directory exists
    await fs.ensureDir(distDir);
    
    // Move storybook-static to dist/storybook
    if (await fs.pathExists(storybookBuildDir)) {
      await fs.move(storybookBuildDir, storybookDir, { overwrite: true });
      console.log('✅ Storybook moved to dist/storybook');
    } else {
      throw new Error('Storybook build directory not found');
    }

    console.log('📄 Copying CNAME...');
    await fs.copy(path.join(__dirname, '..', 'CNAME'), path.join(distDir, 'CNAME'));

    console.log('🚀 Deploying to GitHub Pages...');
    execSync('gh-pages -d dist --dotfiles', { stdio: 'inherit' });

    console.log('✅ Deployment complete!');
    console.log('🌐 Main site: https://digitaltableteur.com');
    console.log('📚 Storybook: https://digitaltableteur.com/storybook');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployWithStorybook();