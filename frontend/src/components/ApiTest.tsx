/**
 * Component for testing API connection with the backend
 */

import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { useCurrentUser, useLogin } from '@/queries';
import { useAuthStore } from '@/store/auth.store';

interface ApiTestResult {
  endpoint: string;
  status: number;
  data: any;
  error?: string;
  timestamp: string;
}

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'admin123'
  });

  // Auth store and queries
  const { user } = useAuthStore();
  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const loginMutation = useLogin();

  const addResult = (result: ApiTestResult) => {
    setResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    const url = `http://localhost:8000${endpoint}`;
    const timestamp = new Date().toLocaleTimeString();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) })
      };

      const response = await fetch(url, options);
      const data = await response.json();

      addResult({
        endpoint: `${method} ${endpoint}`,
        status: response.status,
        data,
        timestamp
      });

      return { response, data };
    } catch (error) {
      addResult({
        endpoint: `${method} ${endpoint}`,
        status: 0,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      });
      throw error;
    }
  };

  const testApiDocs = async () => {
    setIsLoading(true);
    try {
      await testEndpoint('/api/docs/');
    } catch (error) {
      console.error('API Docs test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      await testEndpoint('/api/v1/auth/login/', 'POST', credentials);
    } catch (error) {
      console.error('Login test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test using React Query mutations
  const testLoginWithQuery = async () => {
    setIsLoading(true);
    const timestamp = new Date().toISOString();
    
    loginMutation.mutate(credentials, {
      onSuccess: (data) => {
        addResult({
          endpoint: 'React Query Login',
          status: 200,
          data: { user: data.user, hasTokens: !!data.tokens },
          timestamp
        });
        setIsLoading(false);
      },
      onError: (error: any) => {
        addResult({
          endpoint: 'React Query Login',
          status: error.status || 400,
          data: null,
          error: error.message,
          timestamp
        });
        setIsLoading(false);
      }
    });
  };

  // Test current user with React Query
  const testCurrentUser = async () => {
    setIsLoading(true);
    const timestamp = new Date().toISOString();
    
    try {
      const userData = await refetchUser();
      addResult({
        endpoint: 'React Query Current User',
        status: 200,
        data: userData.data,
        timestamp
      });
    } catch (error: any) {
      addResult({
        endpoint: 'React Query Current User',
        status: error.status || 400,
        data: null,
        error: error.message,
        timestamp
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCategories = async () => {
    setIsLoading(true);
    try {
      await testEndpoint('/api/v1/categories/');
    } catch (error) {
      console.error('Categories test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testProducts = async () => {
    setIsLoading(true);
    try {
      await testEndpoint('/api/v1/products/');
    } catch (error) {
      console.error('Products test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🔌 API Connection Test</h2>
      
      {/* Test Controls */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        <Button
          primary
          onClick={testApiDocs}
          disabled={isLoading}
        >
          Test API Docs
        </Button>
        
        <Button
          onClick={testCategories}
          disabled={isLoading}
        >
          Test Categories
        </Button>
        
        <Button
          onClick={testProducts}
          disabled={isLoading}
        >
          Test Products
        </Button>
        
        <Button
          onClick={testLogin}
          disabled={isLoading}
        >
          Test Login (Direct)
        </Button>

        <Button
          themeColor="secondary"
          onClick={testLoginWithQuery}
          disabled={isLoading}
        >
          Test Login (React Query)
        </Button>

        <Button
          themeColor="info"
          onClick={testCurrentUser}
          disabled={isLoading}
        >
          Test Current User (React Query)
        </Button>
        
        <Button
          fillMode="outline"
          onClick={clearResults}
          disabled={isLoading}
        >
          Clear Results
        </Button>
      </div>

      {/* Login Credentials */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        <div>
          <label>Username:</label>
          <Input
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>
        <div>
          <label>Password:</label>
          <Input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div>🔄 Testing API connection...</div>
        </div>
      )}

      {/* Current Auth Status */}
      <div style={{
        background: '#e8f4fd',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3>🔐 Authentication Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
          <div>
            <strong>Store User:</strong> {user ? `${user.username} (${user.role})` : 'Not authenticated'}
          </div>
          <div>
            <strong>Query User:</strong> {currentUser ? `${currentUser.username} (${currentUser.role})` : 'Not loaded'}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {user ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Query Status:</strong> {currentUser ? '✅ Loaded' : '⏳ Not loaded'}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3>📊 Test Results</h3>
        {results.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No tests run yet. Click a button above to test API endpoints.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((result, index) => (
              <div
                key={`${result.endpoint}-${result.timestamp}-${index}`}
                style={{
                  background: result.error ? '#fee' : result.status === 200 ? '#efe' : '#fef0e6',
                  border: `1px solid ${result.error ? '#fcc' : result.status === 200 ? '#cfc' : '#fed7aa'}`,
                  borderRadius: '8px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong>{result.endpoint}</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ 
                      background: result.error ? '#c33' : result.status === 200 ? '#3c3' : '#f90',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {result.error ? 'ERROR' : `${result.status}`}
                    </span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {result.timestamp}
                    </span>
                  </div>
                </div>
                
                {result.error ? (
                  <div style={{ color: '#c33' }}>
                    <strong>Error:</strong> {result.error}
                  </div>
                ) : (
                  <div>
                    <pre style={{ 
                      background: '#f8f8f8', 
                      padding: '10px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      margin: 0
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ApiTest;
