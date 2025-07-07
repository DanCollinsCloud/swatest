# Secure Azure Static Web App with Azure Maps

This project demonstrates a secure enterprise-ready Azure Static Web App using React.js with:
- **Entra ID user authentication** (users must login)
- **Azure Key Vault** for secure secret storage
- **Managed Identity** for secure Key Vault access
- **Azure Maps integration** with enterprise security

## Security Architecture

```
User → Entra ID Login → Static Web App → Managed Identity → Key Vault → Azure Maps
      (user auth)                    (secure key access)
```

## Features

- ✅ React.js application built with Create React App
- ✅ Azure Static Web Apps hosting with built-in authentication
- ✅ **Entra ID authentication required** - Users must login to access
- ✅ **Azure Key Vault integration** - Secrets stored securely
- ✅ **Managed Identity** - No secrets in application code
- ✅ Azure Maps integration with secure authentication
- ✅ TypeScript support
- ✅ Zero Trust security model
- ✅ Enterprise-ready architecture

## Prerequisites

Before setting up this application, you'll need:

1. **Azure Subscription**: An active Azure subscription
2. **Entra ID Tenant**: Access to configure app registrations
3. **Azure Maps Account**: Create an Azure Maps account and get a subscription key
4. **Azure Key Vault**: For storing secrets securely

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd swatest
npm install
```

### 2. Local Development Setup

Create a `.env.local` file with:

```env
# Azure Maps subscription key for local development fallback
REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY=your-azure-maps-subscription-key

# Key Vault configuration (for production)
REACT_APP_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
REACT_APP_SUBSCRIPTION_KEY_SECRET_NAME=azure-maps-subscription-key
```

### 3. Run Locally

```bash
npm start
```

**Note**: For local development, the app uses the subscription key directly. In production, it will use Key Vault + Managed Identity.

## Production Deployment

For production deployment with full security, see [SECURITY_SETUP.md](./SECURITY_SETUP.md) for detailed instructions.

### Quick Overview:

1. **Create Azure Key Vault** and store your Azure Maps subscription key
2. **Deploy to Azure Static Web Apps** 
3. **Enable Managed Identity** on the Static Web App
4. **Grant Key Vault access** to the Managed Identity
5. **Configure Entra ID** app registration for user authentication
6. **Set application settings** in Azure Static Web Apps

## Authentication Flow

### Local Development:
- No user authentication required
- Uses subscription key from environment variables

### Production:
1. User must login with Entra ID credentials
2. Static Web App uses Managed Identity to access Key Vault
3. Key Vault provides Azure Maps subscription key securely
4. Application uses subscription key to authenticate with Azure Maps

## Security Features

✅ **User Authentication**: Entra ID required for all access  
✅ **Secret Management**: Subscription keys stored in Key Vault  
✅ **Managed Identity**: No secrets in application code  
✅ **Zero Trust**: All access requires authentication  
✅ **Audit Trail**: All Key Vault access is logged  
✅ **Enterprise Ready**: Follows Azure security best practices

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Files Overview

### Core Application Files:
- `src/authConfig.ts` - Authentication configuration and Key Vault integration
- `src/components/AzureMapComponent.tsx` - Azure Maps component with secure authentication
- `src/components/MainContent.tsx` - Main application component with user authentication
- `staticwebapp.config.json` - Static Web Apps configuration with Entra ID auth
- `SECURITY_SETUP.md` - Detailed production setup instructions

### Configuration Files:
- `.env.local` - Local development environment variables
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Development vs Production

| Feature | Local Development | Production |
|---------|------------------|------------|
| User Auth | Not required | **Entra ID required** |
| Secret Storage | Environment variables | **Azure Key Vault** |
| Access Control | Open | **Managed Identity** |
| Security Level | Basic | **Enterprise** |

## Important Notes

⚠️ **The README was previously outdated** - this application now implements:
- **User authentication required** (not service principal auth)
- **Key Vault + Managed Identity** (not client credentials flow)
- **Enterprise security model** (not client-side only)

See `SECURITY_SETUP.md` for detailed production setup instructions.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
