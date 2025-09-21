# Beta Testing Platform

A modern React-based platform for beta testing applications.

## 🚀 Quick Deploy to Netlify

This project is configured for easy deployment to Netlify:

1. **Connect to Netlify**: Go to [Netlify](https://netlify.com) and connect your GitHub repository
2. **Automatic Deployment**: Netlify will automatically detect the configuration and deploy
3. **Live Site**: Your site will be available at a Netlify subdomain

## 📁 Project Structure

- `beta_testing_platform_code/beta-testing-frontend/` - React frontend application
- `beta_testing_platform_code/beta_testing_platform/` - Python backend (optional)

## 🛠️ Local Development

```bash
cd beta_testing_platform_code/beta-testing-frontend/
pnpm install
pnpm run dev
```

## 📋 Features

- Modern React 19 with Vite
- Tailwind CSS for styling
- Responsive design
- User authentication (localStorage-based for demo)
- Feedback collection system

## 🔧 Configuration

The project includes:
- `netlify.toml` - Netlify deployment configuration
- `_redirects` - SPA routing support
- Environment variables support

### Environment Variables

For the backend to work with Google Sheets integration, set the `GOOGLE_SERVICE_ACCOUNT` environment variable with your service account JSON.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
For environment setup, see [beta_testing_platform/ENVIRONMENT_SETUP.md](./beta_testing_platform_code/beta_testing_platform/ENVIRONMENT_SETUP.md).
