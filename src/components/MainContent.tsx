import React, { useState, useEffect } from 'react';
import { getCurrentUser, azureMapsConfig } from '../authConfig';
import { AzureMapComponent } from './AzureMapComponent';
import './MainContent.css';

export const MainContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Only set error if not in local development mode
          if (!azureMapsConfig.isLocalDevelopment) {
            setError('Not authenticated');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="main-content">
      <header className="app-header">
        <h1>🔐 Secure Azure Static Web App with Azure Maps</h1>
        <div className="auth-section">
          <div className="status-info">
            <span className="status-label">Mode:</span>
            <span className={`status-indicator ${user ? 'configured' : 'not-configured'}`}>
              {isLoading ? 'Checking...' : 
               azureMapsConfig.isLocalDevelopment ? 'Local Development' : 
               user ? `Authenticated as ${user.userDetails}` : 'Not Authenticated'}
            </span>
          </div>
          
          {azureMapsConfig.isLocalDevelopment && (
            <div style={{ marginTop: '10px', fontSize: '14px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
              <strong>🔧 Local Development Mode:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>✅ Authentication bypassed for local testing</li>
                <li>✅ Using subscription key from environment variables</li>
                <li>✅ No Azure AD login required</li>
              </ul>
            </div>
          )}
          
          {user && !azureMapsConfig.isLocalDevelopment && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Security Features:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>✅ Entra ID authentication required</li>
                <li>✅ Azure Maps key secured in Key Vault</li>
                <li>✅ Managed Identity access control</li>
              </ul>
            </div>
          )}
        </div>
      </header>
      
      <main className="main-section">
        {isLoading ? (
          <div className="loading-message">
            <h2>🔐 Initializing...</h2>
            <p>{azureMapsConfig.isLocalDevelopment ? 'Starting local development mode...' : 'Verifying Entra ID credentials...'}</p>
          </div>
        ) : error && !azureMapsConfig.isLocalDevelopment ? (
          <div className="error-message">
            <h2>❌ Authentication Required</h2>
            <p>You must be logged in to access this application.</p>
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={() => window.location.href = '/.auth/login/aad'}
                style={{
                  backgroundColor: '#0066cc',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🔐 Login with Entra ID
              </button>
            </div>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <p><strong>This application requires:</strong></p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Valid Entra ID (Azure AD) account</li>
                <li>Proper permissions configured</li>
                <li>Azure Static Web Apps authentication</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="map-container">
            <h2>🗺️ {azureMapsConfig.isLocalDevelopment ? 'Azure Maps (Local Development)' : 'Secure Azure Maps'}</h2>
            <AzureMapComponent />
          </div>
        )}
      </main>
    </div>
  );
};
