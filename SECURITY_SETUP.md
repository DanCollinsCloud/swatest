# Secure Azure Static Web App with Key Vault Setup

This application demonstrates a secure architecture using:
- **Entra ID authentication**: Users must login to access the app
- **Azure Key Vault**: Stores the Azure Maps subscription key securely
- **Managed Identity**: Provides secure access to Key Vault (in production)

## Important Security Note

**Two separate authentication mechanisms are used:**

1. **User Authentication** (Entra ID App Registration):
   - Purpose: Allow users to login to the web application
   - Requires: Client ID and Client Secret (configured in Azure Static Web Apps)
   - Used by: Azure Static Web Apps built-in authentication

2. **Key Vault Access** (Managed Identity):
   - Purpose: Allow the application to retrieve secrets from Key Vault
   - Requires: NO secrets! Uses Azure Managed Identity
   - Used by: Application code to access Key Vault

**The client ID/secret are NOT used for Key Vault access - that's the whole point of Managed Identity!**

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
