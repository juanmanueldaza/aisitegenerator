import React from 'react';
import useAuth from '@/hooks/useAuth';

interface LoginButtonProps {
  clientId: string;
  className?: string;
  children?: React.ReactNode;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  clientId,
  className = '',
  children = 'Login with GitHub',
}) => {
  const { getAuthUrl, loading } = useAuth();

  const handleLogin = () => {
    const authUrl = getAuthUrl(clientId);
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`login-button ${className}`}
      data-testid="login-button"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default LoginButton;