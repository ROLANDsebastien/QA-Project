import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return key as is for simplicity
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaEnvelope: () => <div data-testid="fa-envelope" />,
  FaLock: () => <div data-testid="fa-lock" />,
}));

import { signIn } from 'next-auth/react';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with inputs and buttons', () => {
    render(<LoginForm onClose={mockOnClose} onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByLabelText('auth.login.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.login.password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'navbar.login' })).toBeInTheDocument();
    expect(screen.getByText('auth.login.noAccount')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'navbar.register' })).toBeInTheDocument();
  });

  it('updates email and password on input change', () => {
    render(<LoginForm onClose={mockOnClose} onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('auth.login.email');
    const passwordInput = screen.getByLabelText('auth.login.password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls signIn on form submit and closes on success', async () => {
    mockSignIn.mockResolvedValue({ ok: true });

    render(<LoginForm onClose={mockOnClose} onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('auth.login.email');
    const passwordInput = screen.getByLabelText('auth.login.password');
    const submitButton = screen.getByRole('button', { name: 'navbar.login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error on signIn failure', async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: 'invalidCredentials' });

    render(<LoginForm onClose={mockOnClose} onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('auth.login.email');
    const passwordInput = screen.getByLabelText('auth.login.password');
    const submitButton = screen.getByRole('button', { name: 'navbar.login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('auth.login.invalidCredentials')).toBeInTheDocument();
    });
  });

  it('calls onSwitchToRegister when register button is clicked', () => {
    render(<LoginForm onClose={mockOnClose} onSwitchToRegister={mockOnSwitchToRegister} />);

    const registerButton = screen.getByRole('button', { name: 'navbar.register' });
    fireEvent.click(registerButton);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

    render(<LoginForm onClose={mockOnClose} onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('auth.login.email');
    const passwordInput = screen.getByLabelText('auth.login.password');
    const submitButton = screen.getByRole('button', { name: 'navbar.login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
