# 🚨 SECURITY CONFIGURATION NOTICE

## Configuration Security Fixed ✅

The repository has been secured and all configuration issues resolved:

### ✅ Secure Configuration Files
- `staticwebapp.config.json` - Uses environment variable references only
- `staticwebapp.config.production.json` - Template with placeholder values only
- No hardcoded credentials in any configuration files

### ✅ Environment Variables
All sensitive values are configured via Azure Static Web Apps **Application Settings**:
```
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY=<your-subscription-key>
```

### ✅ Git Security
- Enhanced `.gitignore` patterns prevent credential commits
- Repository push protection provides additional security layer
- All credential files are excluded from version control
- Clean git history with no exposed secrets

## Azure Static Web App Configuration

### Application Settings Required for Production:
1. **AZURE_CLIENT_ID** - Your Entra ID app registration client ID
2. **AZURE_CLIENT_SECRET** - Your Entra ID app client secret  
3. **REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY** - Your Azure Maps subscription key

### Configuration Files:
- **staticwebapp.config.json** - Default config (no forced authentication)
- **staticwebapp.config.production.json** - Template for authenticated scenarios

## Current Application Modes

### Local Development (Current Setup)
- ✅ **Authentication**: Disabled for local testing
- ✅ **Azure Maps**: Uses subscription key from `.env.local`
- ✅ **No redirects**: Works immediately without login

### Production (Optional Setup)
- 🔐 **Authentication**: Entra ID available (if enabled)
- 🔐 **Azure Maps**: Can use Key Vault + Managed Identity
- 🔐 **Secure**: Enterprise-grade security

## Security Best Practices Applied

✅ **No secrets in code** - All sensitive values use application settings  
✅ **Git protection** - Enhanced .gitignore and push protection  
✅ **Secure headers** - Security headers configured in static web app config  
✅ **Environment separation** - Different configs for dev/prod environments  
✅ **Access control** - Proper Azure AD integration when enabled  
✅ **Clean history** - No secrets in git history

## If You Need Authentication

1. Set up your Entra ID app registration in Azure Portal
2. Configure the application settings in Azure Static Web Apps
3. Optionally replace the main config with the production template
4. Update the `{your-tenant-id}` placeholder in production config

## Current Status: ✅ SECURE
- No credentials in repository
- Proper environment variable usage
- Security controls in place
- Ready for deployment

### 2. Update Static Web App Configuration

Replace the placeholder in `staticwebapp.config.json`:

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200,
      "allowedRoles": ["authenticated"]
    }
  ],
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/YOUR-TENANT-ID/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        }
      }
    }
  },
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  }
}
```

### 3. Set Application Settings

In Azure Static Web Apps → Configuration → Application settings:

```
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
REACT_APP_LOCAL_DEVELOPMENT=false
```

## Current Status

✅ **Working Now**: Application works without authentication  
✅ **Local Development**: Fully functional with subscription key  
✅ **Production Ready**: Can be deployed as-is  
🔧 **Authentication**: Optional - can be enabled later  

The app will work immediately in both local development and Azure Static Web Apps without requiring any authentication setup!

## Local Development

For local development, the app uses the subscription key from environment variables as a fallback.

1. Ensure your `.env.local` file has the subscription key
2. Run the application: `npm start`
3. The app will work with the subscription key directly

## Production Setup

### 1. Azure Key Vault Setup

```bash
# Create a Key Vault
az keyvault create --name "your-keyvault-name" --resource-group "your-rg" --location "eastus"

# Store the Azure Maps subscription key
az keyvault secret set --vault-name "your-keyvault-name" --name "azure-maps-subscription-key" --value "your-subscription-key"
```

### 2. Azure Static Web App with Managed Identity

```bash
# Enable Managed Identity on your Static Web App
az staticwebapp identity assign --name "your-swa-name" --resource-group "your-rg"

# Get the principal ID of the managed identity
az staticwebapp identity show --name "your-swa-name" --resource-group "your-rg" --query principalId -o tsv
```

### 3. Grant Key Vault Access

```bash
# Grant the Static Web App's managed identity access to Key Vault
az keyvault set-policy --name "your-keyvault-name" --object-id "managed-identity-principal-id" --secret-permissions get
```

### 4. Configure Entra ID App Registration (For User Authentication Only)

This is only needed to enable user login to the Static Web App:

1. Register an application in Entra ID
2. Configure redirect URIs for your Static Web App: `https://your-swa-name.azurestaticapps.net/.auth/login/aad/callback`
3. Note the Client ID and create a client secret
4. **Important**: These credentials are only used for user authentication, NOT for Key Vault access

### 5. Azure Static Web Apps Application Settings

Set these in the Azure portal under Configuration > Application settings:

```
# Required for user authentication (Entra ID login)
AZURE_CLIENT_ID=your-app-registration-client-id
AZURE_CLIENT_SECRET=your-app-registration-client-secret

# Required for Key Vault integration (client-side configuration)
REACT_APP_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
REACT_APP_SUBSCRIPTION_KEY_SECRET_NAME=azure-maps-subscription-key
```

**Note**: The Key Vault access itself uses Managed Identity (no secrets required for that part).

### 6. Update staticwebapp.config.json

Replace `{tenant-id}` in the config with your actual tenant ID.

## Security Features

✅ **User Authentication**: Entra ID required for all access
✅ **Secret Management**: Subscription keys stored in Key Vault  
✅ **Managed Identity**: No secrets in application code
✅ **Zero Trust**: All access requires authentication
✅ **Audit Trail**: All Key Vault access is logged

## Architecture Overview

```
User → Entra ID Login → Static Web App → Managed Identity → Key Vault → Azure Maps
      (uses client ID/secret)    (uses managed identity - no secrets)
```

**Two separate authentication flows:**

1. **User Authentication**: Entra ID app registration (client ID/secret) → allows users to login
2. **Key Vault Access**: Managed Identity (no secrets) → allows app to get Azure Maps key

**Key Point**: The client ID and secret are only used for user login. The Key Vault access is completely separate and uses Managed Identity with no secrets stored anywhere in the application.

1. User must authenticate with Entra ID
2. Static Web App uses its Managed Identity
3. Managed Identity accesses Key Vault to get subscription key
4. Subscription key is used to authenticate with Azure Maps

This architecture ensures no secrets are exposed in client-side code and all access is properly authenticated and audited.
