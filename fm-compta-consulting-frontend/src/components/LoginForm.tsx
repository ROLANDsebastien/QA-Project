import React, { useState, FormEvent } from 'react';
import { useTranslation } from 'next-i18next';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useRouter } from 'next/router';

// Moins de logs ici pour clarté

type LoginFormProps = {
  onClose: () => void;
  onSwitchToRegister: () => void;
};

const LoginForm = ({ onClose, onSwitchToRegister }: LoginFormProps) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log pour voir l'état à chaque rendu
  console.log(`>>> LoginForm RENDER: isLoading=${isLoading}, error=${error}`);

  // --- MODIFIED handleSubmit using signIn ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('>>> LoginForm: handleSubmit START (using signIn)');
    setIsLoading(true);
    setError(null);
    console.log(`>>> LoginForm: Attempting signIn for email: [${email}], password: [${password ? '******' : 'EMPTY'}]`);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Important: gérer la redirection manuellement par le Layout
        email: email,
        password: password,
      });

      console.log('>>> LoginForm: signIn result:', result);

      if (result?.ok) {
        // *** CORRECTION: Ne PAS rediriger ici ***
        console.log('>>> LoginForm: signIn successful, closing modal ONLY.');
        onClose(); // Fermer la modale. Le Layout gérera la redirection.
        // *** FIN CORRECTION ***
      } else {
        console.error('>>> LoginForm: signIn failed:', result?.error);
        setError(result?.error ? t(`auth.login.${result.error}`) : t('auth.login.invalidCredentials'));
      }
    } catch (err: any) {
      console.error('>>> LoginForm: CRITICAL error during signIn call:', err);
      setError(t('auth.login.loginError') + (err.message ? `: ${err.message}` : ''));
    } finally {
      console.log('>>> LoginForm: handleSubmit finally block, setting isLoading=false');
      setIsLoading(false);
    }
  };
  // --- End of MODIFIED handleSubmit ---

  return (
    // Utiliser onSubmit sur le formulaire
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.login.email')}
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
            {t('auth.login.password')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {t('navbar.login')}
        </button>
      </div>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          {t('auth.login.noAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary-dark font-medium"
          >
            {t('navbar.register')}
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;