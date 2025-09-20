import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
// PAS d'import Mongoose/bcrypt ici !

console.log('[!!!] Loading [...nextauth].ts module...');

// Vérifier et logger NEXTAUTH_SECRET au chargement
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  console.error('[!!!] CRITICAL ERROR: NEXTAUTH_SECRET environment variable is not set!');
} else {
  console.log('[!!!] NEXTAUTH_SECRET is set (length:', nextAuthSecret.length, ').'); // Ne pas logger la valeur elle-même
}

// Vérifier MONGODB_URI aussi, juste au cas où
if (!process.env.MONGODB_URI) {
  console.warn('[!!!] WARNING: MONGODB_URI environment variable is not set! (May cause issues later)');
}

interface CredentialsType {
  email?: string;
  password?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: CredentialsType | undefined): Promise<NextAuthUser | null> {
        console.log('[AUTH] >>> Authorize function entered.');

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Authorize: Credentials missing (email or password empty).');
          throw new Error('MissingCredentials');
        }

        console.log(`[AUTH] Authorize: Credentials received for email: ${credentials.email}`);

        // Utiliser l'URL interne du backend pour les appels serveur-à-serveur
        const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        console.log(`[AUTH] Authorize: Using API URL = "${apiUrl}" (Type: ${typeof apiUrl})`);

        if (typeof apiUrl !== 'string' || apiUrl.trim() === '') {
          console.error('[AUTH] CRITICAL ERROR: API URL is invalid!');
          throw new Error('ConfigurationError');
        }

        const backendUrl = `${apiUrl}/auth/validate`;
        console.log(`[AUTH] Authorize: Constructed backend URL = "${backendUrl}"`);

        try {
          console.log(`[AUTH] Authorize: Preparing to fetch backend at ${backendUrl}`);

          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log(`[AUTH] Authorize: Fetch call completed. Backend response status: ${response.status}`);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            console.log(`[AUTH] Backend validation failed: Status ${response.status}, Message: ${errorData.message || '(no message)'}`);
            throw new Error(response.status === 401 ? 'InvalidCredentials' : 'BackendError');
          }

          const userData = await response.json();
          console.log('[AUTH] Backend validation successful. User data received:', userData);

          if (!userData?.id || !userData?.email) {
            console.error('[AUTH] Backend returned success but user data is incomplete (missing id or email).');
            throw new Error('InvalidUserData');
          }

          console.log('[AUTH] Authorize successful, returning user object.');
          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          } as NextAuthUser & { role?: string };

        } catch (error: any) {
          console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          console.error('[AUTH] ERROR in authorize fetch/logic:', error);
          console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          const errorMessage = ['MissingCredentials', 'ConfigurationError', 'InvalidCredentials', 'BackendError', 'InvalidUserData'].includes(error.message)
            ? error.message
            : 'UnknownAuthorizeError';
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: (NextAuthUser & { role?: string }) }): Promise<JWT> {
      console.log('[CB] JWT callback started. User object present:', !!user);
      if (user) {
        console.log('[CB] JWT: Mapping user data to token:', { id: user.id, role: user.role });
        token.id = user.id;
        token.role = user.role;
      } else {
        console.log('[CB] JWT: No user object, token passed through:', { id: token.id, role: token.role, email: token.email, name: token.name });
      }
      console.log('[CB] JWT callback finished. Returning token:', { id: token.id, role: token.role, email: token.email, name: token.name });
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }): Promise<any> {
      console.log('[CB] Session callback started. Token received:', { id: token?.id, role: token?.role, email: token?.email, name: token?.name });
      if (token && session.user) {
        console.log('[CB] Session: Mapping token data to session.user');
        session.user.id = token.id;
        session.user.role = token.role;
      } else {
        console.log('[CB] Session: No token or session.user found, session passed through.');
      }
      console.log('[CB] Session callback finished. Returning session user:', session.user);
      return session;
    },
    async redirect({ url, baseUrl, token }: { url: string; baseUrl: string; token?: JWT | null }): Promise<string> {
      console.log(`[CB] Redirect callback: url=${url}, baseUrl=${baseUrl}, tokenRole=${token?.role}`);

      const relativeUrl = url.startsWith(baseUrl) ? url.substring(baseUrl.length) : url;

      // Si l'utilisateur est connecté (token existe)
      if (token) {
        // Si l'utilisateur est admin, toujours rediriger vers /admin après connexion
        if (token.role === 'admin') {
          console.log('[CB] Redirect: Admin detected. Redirecting to /admin.');
          return `${baseUrl}/admin`;
        }

        // Si l'utilisateur n'est pas admin et l'URL de redirection est la racine, rediriger vers /profile
        if (relativeUrl === '/' || relativeUrl === '') {
          console.log('[CB] Redirect: Non-admin logged in, redirecting from base URL to /profile.');
          return `${baseUrl}/profile`;
        }

        // Sinon (non-admin allant vers une URL spécifique), laisser l'URL par défaut
        console.log(`[CB] Redirect: Non-admin logged in, allowing redirection to original relative URL: ${relativeUrl}`);
        return url;
      }

      // Si l'utilisateur n'est pas connecté, laisser NextAuth gérer (généralement redir vers la page de connexion)
      console.log(`[CB] Redirect: User not logged in. Returning default URL: ${url}`);
      return url;
    }
  },
  events: {
    signOut: async (message) => {
      console.log("[EVENT] signOut event triggered", message);
    },
    session: async (message) => {
      console.log("[EVENT] session event triggered", message);
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
    signOut: '/'
  },
};

// Log avant d'exporter le handler
console.log('[!!!] Defining NextAuth handler function...');

const nextAuthHandler = NextAuth(authOptions);

// Log après la définition
console.log('[!!!] NextAuth handler function defined. Exporting wrapped handler...');

// Exporter un wrapper pour logger les requêtes entrantes
export default async function (req: any, res: any) {
  console.log('>>>>>>>>>>>>>> API ROUTE HANDLER HIT <<<<<<<<<<<<<<');
  const requestUrl = req.url || '(no url)';
  console.log(`[!!!] Request received for ${requestUrl}`);

  try {
    await nextAuthHandler(req, res);
    console.log(`[!!!] Request for ${requestUrl} handled by NextAuth.`);
  } catch (error) {
    console.error(`[!!!] Error handling request for ${requestUrl}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error in NextAuth wrapper' });
    }
  }
}