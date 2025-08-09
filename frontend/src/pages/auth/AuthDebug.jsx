import React, { useState, useEffect } from 'react';
import { testAuthState, clearAllAuthData } from '../../utils/authTest.js';
import { setToken, getToken } from '../../utils/auth.js';

const AuthDebug = () => {
  const [authResult, setAuthResult] = useState(null);
  const [currentToken, setCurrentToken] = useState('');

  useEffect(() => {
    setCurrentToken(getToken() || 'No token');
  }, []);

  const testAuth = async () => {
    const result = await testAuthState();
    setAuthResult(result);
  };

  const simulateLogin = () => {
    // Simulate the token from our test
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGYxNjk4MDExNzk0MTkwZDcyMDNmNiIsImlhdCI6MTc1NDIxNjMzMiwiZXhwIjoxNzU0MzAyNzMyfQ.JEnc6rK8B7m1mZLipJjms-HUcn1wMLQqi-DAk7h5l4g";
    setToken(testToken);
    setCurrentToken(testToken);
    localStorage.setItem('userId', '688f1698011794190d7203f6');
    localStorage.setItem('userEmail', 'test@example.com');
    localStorage.setItem('userName', 'Bhashkar Kumar');
    alert('Token set! Now test auth.');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Current Token:</h3>
          <p className="text-sm break-all">{currentToken}</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={simulateLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Simulate Login
          </button>
          
          <button 
            onClick={testAuth}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Auth
          </button>
          
          <button 
            onClick={() => {
              clearAllAuthData();
              setCurrentToken('No token');
              setAuthResult(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>

        {authResult && (
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="font-semibold">Auth Test Result:</h3>
            <pre className="text-sm mt-2">{JSON.stringify(authResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
