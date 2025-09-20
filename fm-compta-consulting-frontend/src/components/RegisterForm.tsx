import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

type RegisterFormProps = {
  onClose: () => void;
  onSwitchToLogin: () => void;
};

const RegisterForm = ({ onClose, onSwitchToLogin }: RegisterFormProps) => {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      // Utiliser l'API route Next.js pour éviter les problèmes CORS
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      // After successful registration, sign in the user automatically
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error || t('auth.login.invalidCredentials'));
      }

      // Close the modal and let NextAuth handle redirection based on user role
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.register.registerError'));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.name')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.email')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300"
              placeholder="exemple@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.password')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.confirmPassword')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary flex justify-center items-center bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark"
        >
          {isLoading ? (
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          ) : null}
          {t('navbar.register')}
        </button>
      </div>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          {t('auth.register.hasAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary-dark font-medium"
          >
            {t('navbar.login')}
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;