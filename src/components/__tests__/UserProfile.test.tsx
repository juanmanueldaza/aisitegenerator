import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from '../UserProfile';
import { GitHubUser } from '@/types';

describe('UserProfile', () => {
  const mockUser: GitHubUser = {
    id: 1,
    login: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    avatar_url: 'https://github.com/images/error/testuser_happy.gif',
  };

  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user information', () => {
    render(<UserProfile user={mockUser} onLogout={mockOnLogout} />);

    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-login')).toHaveTextContent('@testuser');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('should render avatar with correct attributes', () => {
    render(<UserProfile user={mockUser} onLogout={mockOnLogout} />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveAttribute('src', mockUser.avatar_url);
    expect(avatar).toHaveAttribute('alt', "Test User's avatar");
  });

  it('should use login as fallback when name is not available', () => {
    const userWithoutName = { ...mockUser, name: '' };
    
    render(<UserProfile user={userWithoutName} onLogout={mockOnLogout} />);

    expect(screen.getByTestId('user-name')).toHaveTextContent('testuser');
    
    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveAttribute('alt', "testuser's avatar");
  });

  it('should not render email when not provided', () => {
    const userWithoutEmail = { ...mockUser, email: '' };
    
    render(<UserProfile user={userWithoutEmail} onLogout={mockOnLogout} />);

    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('should call onLogout when logout button is clicked', () => {
    render(<UserProfile user={mockUser} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onLogout={mockOnLogout} 
        className="custom-class" 
      />
    );

    const userProfile = screen.getByTestId('user-profile');
    expect(userProfile).toHaveClass('user-profile', 'custom-class');
  });

  it('should render logout button', () => {
    render(<UserProfile user={mockUser} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveTextContent('Logout');
  });
});