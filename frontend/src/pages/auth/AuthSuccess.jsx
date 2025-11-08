import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = () => {
      // console.log('ðŸŽ¯ AuthSuccess page loaded');
      // console.log('ðŸ” Current URL:', window.location.href);
      // console.log('ðŸ” Search params:', searchParams.toString());
      
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');

      // console.log('ðŸ”‘ OAuth Success - Received data:',
      //  { 
      //   hasToken: !!token, 
      //   tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
      //   userId, 
      //   email, 
      //   name 
      // });

      if (token && userId && email && name) {
        // Use AuthContext login method
        login(token, {
          id: userId,
          email: email,
          name: name
        });
        
        // console.log('âœ… OAuth data stored successfully');
        // console.log('ðŸš€ Navigating to dashboard...');
        
        // Small delay to ensure authentication state is updated
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        // console.error('âŒ Missing OAuth data:', { token: !!token, userId, email, name });
        navigate('/login?error=oauth_incomplete');
      }
    };

    handleOAuthSuccess();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing your login...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
