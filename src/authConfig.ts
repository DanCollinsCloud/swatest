// Simplified Azure Maps authentication with SWA built-in auth and Key Vault
interface SWAUser {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export const azureMapsConfig = {
  // Check if we're in local development mode
  isLocalDevelopment: process.env.REACT_APP_LOCAL_DEVELOPMENT === 'true',
  
  // Key Vault configuration (set in Azure Static Web Apps application settings)
  keyVaultUrl: process.env.REACT_APP_KEY_VAULT_URL || '',
  subscriptionKeySecretName: process.env.REACT_APP_SUBSCRIPTION_KEY_SECRET_NAME || 'azure-maps-subscription-key',
  
  // Cache for the subscription key
  subscriptionKeyCache: {
    key: null as string | null,
    expiresAt: 0
  }
};

/**
 * Gets the current authenticated user from Azure Static Web Apps
 * Returns null in local development mode
 */
export const getCurrentUser = async (): Promise<SWAUser | null> => {
  // Skip authentication in local development
  if (azureMapsConfig.isLocalDevelopment) {
    return {
      identityProvider: 'local',
      userId: 'local-dev-user',
      userDetails: 'Local Development User',
      userRoles: ['authenticated']
    };
  }

  try {
    const response = await fetch('/.auth/me');
    const payload = await response.json();
    
    if (payload.clientPrincipal) {
      return payload.clientPrincipal as SWAUser;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
};

/**
 * Gets Azure Maps subscription key from Azure Key Vault using the user's access token
 * In local development, uses environment variable directly
 */
export const getAzureMapsSubscriptionKey = async (): Promise<string | null> => {
  try {
    // Check cache first
    const now = Date.now();
    if (azureMapsConfig.subscriptionKeyCache.key && azureMapsConfig.subscriptionKeyCache.expiresAt > now) {
      console.log('Using cached subscription key');
      return azureMapsConfig.subscriptionKeyCache.key;
    }

    // In local development, use environment variable directly
    if (azureMapsConfig.isLocalDevelopment) {
      console.log('🔧 Local development mode: Using subscription key from environment variables');
      const subscriptionKey = process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY;
      
      if (subscriptionKey) {
        // Cache the key for 1 hour
        azureMapsConfig.subscriptionKeyCache.key = subscriptionKey;
        azureMapsConfig.subscriptionKeyCache.expiresAt = now + (60 * 60 * 1000); // 1 hour
        
        console.log('✅ Successfully retrieved Azure Maps subscription key (local dev)');
        return subscriptionKey;
      }
      
      throw new Error('No subscription key available in local development');
    }

    // Production: This would retrieve from Key Vault using Managed Identity
    console.log('🔐 Production mode: Would retrieve key from Azure Key Vault using Managed Identity');
    console.log('📝 Note: In production, this would call Key Vault API with the user\'s token');
    
    // For now, fall back to environment variable with a warning
    console.warn('⚠️ Falling back to environment variable - configure Key Vault for production');
    const subscriptionKey = process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY;
    
    if (subscriptionKey) {
      // Cache the key for 1 hour
      azureMapsConfig.subscriptionKeyCache.key = subscriptionKey;
      azureMapsConfig.subscriptionKeyCache.expiresAt = now + (60 * 60 * 1000); // 1 hour
      
      console.log('✅ Successfully retrieved Azure Maps subscription key (fallback)');
      return subscriptionKey;
    }
    
    throw new Error('No subscription key available');
    
  } catch (error) {
    console.error('❌ Failed to get Azure Maps subscription key:', error);
    return null;
  }
};

/**
 * Gets the authentication configuration for Azure Maps
 */
export const getAzureMapsAuthConfig = async () => {
  console.log('Getting Azure Maps authentication configuration...');
  
  const subscriptionKey = await getAzureMapsSubscriptionKey();
  
  if (subscriptionKey) {
    return {
      authType: 'subscriptionKey',
      subscriptionKey: subscriptionKey
    };
  } else {
    throw new Error('Unable to get Azure Maps subscription key');
  }
};
