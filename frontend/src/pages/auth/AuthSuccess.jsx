import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const finishLogin = (token, user) => {
      login(token, user);
      // Small delay to ensure authentication state is updated
      setTimeout(() => navigate('/dashboard'), 300);
    };

    const handleOAuthSuccess = async () => {
      // Preferred: exchange the short-lived single-use handoff code for the JWT.
      const code = searchParams.get('code');
      if (code) {
        try {
          const { data } = await api.post('/auth/exchange-code', { code });
          if (data?.token && data?.user) {
            finishLogin(data.token, data.user);
            return;
          }
          navigate('/login?error=oauth_incomplete');
        } catch {
          navigate('/login?error=oauth_failed');
        }
        return;
      }

      // Legacy fallback: token passed directly in the URL.
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');

      if (token && userId && email && name) {
        finishLogin(token, { id: userId, email, name });
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
