import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from '../LoginButton';
import useAuth from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('LoginButton', () => {
  const mockGetAuthUrl = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
    
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      getAuthUrl: mockGetAuthUrl,
      githubService: null,
    });
  });

  it('should render with default text', () => {
    render(<LoginButton clientId="test-client-id" />);
    
    const button = screen.getByTestId('login-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Login with GitHub');
  });

  it('should render with custom children', () => {
    render(
      <LoginButton clientId="test-client-id">
        Custom Login Text
      </LoginButton>
    );
    
    const button = screen.getByTestId('login-button');
    expect(button).toHaveTextContent('Custom Login Text');
  });

  it('should apply custom className', () => {
    render(
      <LoginButton clientId="test-client-id" className="custom-class" />
    );
    
    const button = screen.getByTestId('login-button');
    expect(button).toHaveClass('login-button', 'custom-class');
  });

  it('should handle click and redirect to auth URL', () => {
    const authUrl = 'https://github.com/login/oauth/authorize?client_id=test';
    mockGetAuthUrl.mockReturnValue(authUrl);

    render(<LoginButton clientId="test-client-id" />);
    
    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(mockGetAuthUrl).toHaveBeenCalledWith('test-client-id');
    expect(mockLocation.href).toBe(authUrl);
  });

  it('should be disabled when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: true,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      getAuthUrl: mockGetAuthUrl,
      githubService: null,
    });

    render(<LoginButton clientId="test-client-id" />);
    
    const button = screen.getByTestId('login-button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading...');
  });

  it('should not redirect when disabled', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: true,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      getAuthUrl: mockGetAuthUrl,
      githubService: null,
    });

    render(<LoginButton clientId="test-client-id" />);
    
    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(mockGetAuthUrl).not.toHaveBeenCalled();
    expect(mockLocation.href).toBe('');
  });
});