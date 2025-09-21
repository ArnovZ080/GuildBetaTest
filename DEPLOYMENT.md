# Netlify Deployment Guide

## Project Structure
This repository contains a React frontend application that can be deployed to Netlify.

## Deployment Configuration

### Netlify Configuration
The project includes a `netlify.toml` file at the root level with the following configuration:

```toml
[build]
  base = "beta_testing_platform_code/beta-testing-frontend/"
  publish = "beta_testing_platform_code/beta-testing-frontend/dist/"
  command = "pnpm install && pnpm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Key Configuration Details:
- **Base Directory**: Points to the frontend application directory
- **Publish Directory**: Points to the built `dist` folder
- **Build Command**: Uses `pnpm` (the project's package manager)
- **Node Version**: Set to Node 18 for compatibility
- **Redirects**: Configured for Single Page Application (SPA) routing

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub repository
4. Netlify will automatically detect the `netlify.toml` configuration
5. Click "Deploy site"

### Option 2: Deploy via Netlify CLI
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Deploy: `netlify deploy --prod`

## Build Process
The application uses:
- **Package Manager**: pnpm
- **Build Tool**: Vite
- **Framework**: React 19
- **Styling**: Tailwind CSS

## Troubleshooting

### Common Issues:
1. **Build Failures**: Ensure Node.js version 18+ is used
2. **Package Manager**: The project uses `pnpm`, not `npm`
3. **Routing Issues**: The `_redirects` file ensures SPA routing works correctly

### Manual Build Test:
```bash
cd beta_testing_platform_code/beta-testing-frontend/
pnpm install
pnpm run build
```

## Environment Variables
If you need to add environment variables:
1. Go to Site settings > Environment variables in Netlify dashboard
2. Add your variables there
3. Redeploy the site

## Custom Domain
To add a custom domain:
1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify
