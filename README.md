# OneDrive Explorer Documentation

This comprehensive guide will help you set up, deploy, and maintain your OneDrive Explorer application on Vercel, including how to create and configure a PostgreSQL database.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Database Setup](#database-setup)
    - [Creating a PostgreSQL Database with Vercel](#creating-a-postgresql-database-with-vercel)
5. [Environment Configuration](#environment-configuration)
6. [Microsoft Azure App Registration](#microsoft-azure-app-registration)
7. [Deployment to Vercel](#deployment-to-vercel)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Application Features](#application-features)
10. [Maintenance and Troubleshooting](#maintenance-and-troubleshooting)

## Project Overview

OneDrive Explorer is a web application that allows users to browse, view, and download files from their Microsoft OneDrive. Built with Remix, React, and TypeScript, it features:

- File browsing with list and grid views
- File preview for various formats (images, PDF, code, text, etc.)
- File download capabilities
- Responsive design
- Light/dark theme support
- Multi-language support (English, Turkish)
- Microsoft authentication integration

## Prerequisites

Before proceeding, make sure you have:

- Node.js (v18 or newer)
- npm or yarn
- Git
- A GitHub account
- A Microsoft account with access to Azure Portal
- A Vercel account

## Local Development Setup

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/onedrive-index.git
cd onedrive-index
```

2. **Install dependencies:**

```bash
npm install
```

3. **Generate Prisma client:**

```bash
npx prisma generate
```

4. **Generate application secrets:**

```bash
npm run generate-secrets
```

This script will:
- Create a secure `SESSION_SECRET` for your application
- Set up an `APP_PASSWORD` for admin access
- Generate a refresh token secret for token rotation

5. **Start the development server:**

```bash
npm run dev
```

Your application will run at http://localhost:3391

## Database Setup

### Creating a PostgreSQL Database with Vercel

Vercel's PostgreSQL integration provides a fully managed PostgreSQL database:

1. **Log in to your Vercel account** at [vercel.com](https://vercel.com)

2. **Create a new storage instance:**
   - Navigate to the "Storage" tab in the Vercel dashboard
   - Click "Create" and select "Neon, Serverless Postgres"
   - Choose a name for your database (e.g., `onedrive-explorer-db`)
   - Select a region closest to your target audience
   - Select plan (e.g., "Free")
   - Click "Create"

3. **Get your database credentials:**
   - Once created, navigate to your database page
   - You'll see connection details including the `DATABASE_URL`
   - Save this URL for the next steps

4. **Configure your application to use the database:**
   - Add the `DATABASE_URL` to your environment variables (see the Environment Configuration section)

## Environment Configuration

Create a `.env` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Microsoft OAuth
MICROSOFT_APP_ID="your-microsoft-app-id"
MICROSOFT_APP_SECRET="your-microsoft-app-secret"
MICROSOFT_APP_TENANT="common"  # or your tenant ID for organizational accounts
REDIRECT_URI="https://your-domain.com/auth/callback"

# Session
SESSION_SECRET="your-generated-session-secret"

# App Security
APP_PASSWORD="your-admin-password"
```

# Also, change the allowed hosts in the vite.config.ts file to include your domain:

```ts
server: {
  allowedHosts: ["your-domain.com"],
},
```

## Microsoft Azure App Registration

To enable Microsoft authentication:

1. **Go to the Azure Portal** at [portal.azure.com](https://portal.azure.com/)

2. **Navigate to Azure Active Directory > App registrations**

3. **Create a new registration:**
   - Name: "OneDrive Explorer"
   - Supported account types: Choose based on your needs:
     - "Accounts in this organizational directory only" (single tenant)
     - "Accounts in any organizational directory" (multi-tenant)
     - "Accounts in any organizational directory and personal Microsoft accounts" (recommended for personal use)
   - Redirect URI: Web - `https://your-domain.com/auth/callback`

4. **After registration, note down:**
   - Application (client) ID
   - Directory (tenant) ID

5. **Create a client secret:**
   - Go to "Certificates & Secrets"
   - Create a new client secret
   - Copy the secret value (only shown once)

6. **Configure API permissions:**
   - Go to "API permissions"
   - Add permissions for Microsoft Graph:
     - `User.Read` - To get user profile information
     - `Files.Read` - To read OneDrive files
     - `Files.Read.All` - To read all files user has access to
     - `offline_access` - To get refresh tokens
   - Grant admin consent if required

## Deployment to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMrErenK%2Fonedrive-index)

1. **Push your project to GitHub**

2. **Connect to Vercel:**
   - Log in to [Vercel](https://vercel.com)
   - Create a new project
   - Import your GitHub repository
   - Configure project settings:

3. **Configure build settings:**
   - Framework preset: Remix
   - Build command: `npm run build`
   - Output directory: `public`
   - Install command: `npm install`

4. **Configure environment variables:**
   - Add all the environment variables from your `.env` file
   - Make sure to add the correct production URLs

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

6. **Run database migrations:**
   - After deployment, run:
   ```bash
   npx vercel env pull .env.production
   npx prisma db push --schema=./prisma/schema.prisma
   ```

## Post-Deployment Configuration

1. **Configure Token Refresh:**

To keep access tokens fresh, set up a scheduled task:

- **Using Vercel Cron Jobs:**

  There is a `vercel.json` file in your project root:

  ```json
  {
    "crons": [
      {
        "path": "/api/refresh-token",
        "schedule": "*/5 * * * *"
      }
    ]
  }
  ```

  This will call your token refresh endpoint every 5 minutes.

2. **First Login & Setup:**

   - Visit your deployed application
   - You'll be prompted to set up an admin password if not already configured
   - Use the password to log in and authenticate with Microsoft

## Application Features

### File Browser

- **Navigation:** Browse your OneDrive files with breadcrumb navigation
- **View Modes:** Switch between list and grid views
- **Sorting:** Sort by name, date, or size
- **Search:** Search for files and folders

### File Preview

The application supports previewing various file types:

- Images (PNG, JPG, GIF, etc.)
- PDFs
- Text files
- Code files with syntax highlighting
- Markdown files
- Audio files
- Video files
- Microsoft Office documents (via Office Online)

### User Management

- **Authentication:** Microsoft OAuth 2.0 integration
- **Token Refresh:** Automatic refreshing of access tokens
- **Logout:** Secure session termination

### User Interface

- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Theme Support:** Light and dark mode with system preference detection
- **Internationalization:** Multi-language support

## Maintenance and Troubleshooting

### Token Refreshing

Access tokens expire after a certain period. The application includes:

- Automatic token refresh when needed
- A scheduled task to proactively refresh tokens

### Error Handling

Common issues and solutions:

1. **Authentication Failures:**
   - Check Microsoft App registration configuration
   - Verify redirect URIs are exact matches
   - Ensure required permissions are granted

2. **Database Connection Issues:**
   - Verify DATABASE_URL is correct
   - Check if IP allowlist needs to be updated in Vercel

3. **File Access Issues:**
   - Confirm Microsoft Graph permissions are correctly set
   - Verify token refresh is working

### Monitoring and Logs

- Use Vercel's built-in logs to monitor application performance
- Check Functions > Your-Function > Logs for detailed error information
- Set up alerts for critical errors

### Upgrading

To upgrade your application:

1. Pull the latest changes from the repository
2. Run `npm install` to update dependencies
3. Test locally before deploying
4. Deploy to Vercel using your preferred method

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them
4. Push your changes to your fork
5. Submit a pull request

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
