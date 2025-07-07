import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser, getAzureMapsAuthConfig, azureMapsConfig } from '../authConfig';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';

export const AzureMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<atlas.Map | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user (or mock user in local dev)
        console.log('Getting user information...');
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        setUser(currentUser);
        console.log('✅ User information retrieved:', currentUser.userDetails);

        // Initialize the map
        await initializeMap();
        
      } catch (error) {
        console.error('Error initializing app:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    const initializeMap = async () => {
      if (!mapRef.current || map.current) return;

      try {
        console.log('Initializing Azure Maps...');
        
        // Get authentication configuration
        const authConfig = await getAzureMapsAuthConfig();
        
        if (!authConfig.subscriptionKey) {
          throw new Error('No Azure Maps subscription key available');
        }

        // Initialize the map with subscription key authentication
        const mapOptions = {
          center: [-122.33, 47.6], // Seattle coordinates
          zoom: 12,
          language: 'en-US',
          authOptions: {
            authType: atlas.AuthenticationType.subscriptionKey,
            subscriptionKey: authConfig.subscriptionKey,
          },
        };

        const mapInstance = new atlas.Map(mapRef.current, mapOptions);

        // Wait for map to be ready
        mapInstance.events.add('ready', () => {
          console.log('✅ Azure Map ready with secure authentication');
          
          // Add a sample marker
          const marker = new atlas.HtmlMarker({
            color: 'DodgerBlue',
            text: '📍',
            position: [-122.33, 47.6],
          });
          
          mapInstance.markers.add(marker);
          
          // Add a sample popup with appropriate content
          const authMethod = azureMapsConfig.isLocalDevelopment ? 'Local Development' : 'Entra ID + Key Vault';
          const popup = new atlas.Popup({
            content: `<div style="padding: 10px;">
              <strong>${azureMapsConfig.isLocalDevelopment ? 'Azure Maps (Dev Mode)' : 'Secure Azure Maps!'}</strong><br/>
              User: ${user?.userDetails || 'Local User'}<br/>
              Authentication: ${authMethod}<br/>
              <small>${azureMapsConfig.isLocalDevelopment ? 'Development mode - simplified authentication' : 'Subscription key secured in Azure Key Vault'}</small>
            </div>`,
            position: [-122.33, 47.6],
          });
          
          mapInstance.popups.add(popup);
        });

        map.current = mapInstance;
      } catch (error) {
        console.error('Error initializing map:', error);
        throw error;
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.dispose();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct - we only want this to run once

  if (loading) {
    return (
      <div className="loading" style={{ padding: '20px', textAlign: 'center' }}>
        <h3>🔐 Authenticating and Loading...</h3>
        <p>Verifying Entra ID authentication and retrieving secure credentials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{ padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
        <h3>❌ Error</h3>
        <p><strong>Error:</strong> {error}</p>
        <p>Please ensure you are logged in and have proper permissions.</p>
        <button onClick={() => window.location.href = '/.auth/login/aad'}>
          Login with Entra ID
        </button>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <div className="auth-status" style={{ 
        marginBottom: '10px', 
        padding: '10px', 
        backgroundColor: '#e6f3ff', 
        borderRadius: '4px',
        border: '1px solid #0066cc'
      }}>
        <strong>🔐 Secure Authentication Status:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>✅ User authenticated via Entra ID: {user?.userDetails}</li>
          <li>✅ Subscription key retrieved from Azure Key Vault</li>
          <li>✅ Application access restricted to authenticated users</li>
        </ul>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          <a href="/.auth/logout" style={{ color: '#0066cc' }}>Logout</a>
        </div>
      </div>
      
      <div
        ref={mapRef}
        className="azure-map"
        style={{
          height: '500px',
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      />
      
      <div className="map-info">
        <p><strong>🗺️ Secure Azure Maps Features:</strong></p>
        <ul>
          <li>Interactive Azure Maps control</li>
          <li>Authentication: Entra ID required</li>
          <li>Subscription key: Secured in Azure Key Vault</li>
          <li>Access: Managed Identity (when deployed)</li>
          <li>Sample marker and popup</li>
          <li>Centered on Seattle, WA</li>
        </ul>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
          <strong>🔧 Production Setup Required:</strong>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Store Azure Maps subscription key in Azure Key Vault</li>
            <li>Enable Managed Identity on the Static Web App</li>
            <li>Grant Key Vault access to the Managed Identity</li>
            <li>Configure Entra ID app registration</li>
            <li>Set application settings in Azure Static Web Apps</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
