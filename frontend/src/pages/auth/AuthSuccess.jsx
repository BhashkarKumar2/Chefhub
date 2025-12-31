import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = () => {
      
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');

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
        
        
        // Small delay to ensure authentication state is updated
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
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
