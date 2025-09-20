import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';

import Layout from '@/components/Layout';

export default function AuthError() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return t('auth.errors.invalidCredentials');
      case 'AccessDenied':
        return t('auth.errors.accessDenied');
      case 'CallbackRouteError':
        return t('auth.errors.callbackError');
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return t('auth.errors.oauthError');
      case 'OAuthAccountNotLinked':
        return t('auth.errors.accountNotLinked');
      case 'EmailSignin':
        return t('auth.errors.emailSignin');
      case 'CredentialsSignup':
        return t('auth.errors.credentialsSignup');
      case 'SessionRequired':
        return t('auth.errors.sessionRequired');
      default:
        return t('auth.errors.default');
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t('auth.error')} | FM Compta Consulting</title>
        <meta name="description" content="Authentication error" />
      </Head>

      <section className="section pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6 text-primary-dark">{t('auth.error')}</h1>
            
            <div className="card p-6 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass mb-8">
              <p className="text-red-600 mb-4">{getErrorMessage()}</p>
              <p className="mb-6">{t('auth.errorHelp')}</p>
              
              <div className="flex justify-center space-x-4">
                <Link href="/" className="btn btn-primary">
                  {t('common.backToHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fr', ['common'])),
    },
  };
};