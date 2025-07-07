// Simplified Azure Maps authentication with SWA built-in auth and Key Vault
interface SWAUser {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export const azureMapsConfig = {
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
 */
export const getCurrentUser = async (): Promise<SWAUser | null> => {
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
 * Note: This is a simplified example. In reality, you'd need to configure proper permissions
 * and potentially use a backend service for Key Vault access.
 */
export const getAzureMapsSubscriptionKey = async (): Promise<string | null> => {
  try {
    // Check cache first
    const now = Date.now();
    if (azureMapsConfig.subscriptionKeyCache.key && azureMapsConfig.subscriptionKeyCache.expiresAt > now) {
      console.log('Using cached subscription key');
      return azureMapsConfig.subscriptionKeyCache.key;
    }

    // In a real implementation, you would:
    // 1. Get the user's access token from SWA
    // 2. Use that token to call Key Vault
    // 3. For this demo, we'll use a fallback approach
    
    console.log('📝 Note: In production, this would retrieve the key from Azure Key Vault using Managed Identity');
    console.log('📝 For now, using environment variable as fallback');
    
    const subscriptionKey = process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY;
    
    if (subscriptionKey) {
      // Cache the key for 1 hour
      azureMapsConfig.subscriptionKeyCache.key = subscriptionKey;
      azureMapsConfig.subscriptionKeyCache.expiresAt = now + (60 * 60 * 1000); // 1 hour
      
      console.log('✅ Successfully retrieved Azure Maps subscription key');
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
