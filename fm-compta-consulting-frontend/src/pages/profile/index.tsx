import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaCalendarAlt, FaUserCog } from 'react-icons/fa';
import dynamic from 'next/dynamic';

import Layout from '@/components/Layout';

export default function Profile() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to home if not logged in
  if (!session) {
    return null; // This will be handled by getServerSideProps
  }

  return (
    <Layout>
      <Head>
        <title>{t('profile.title')} | FM Compta Consulting</title>
        <meta name="description" content="Votre profil FM Compta Consulting" />
      </Head>

      <section className="section pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="section-title mb-12">{t('profile.title')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Information Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-4">
                    <FaUser className="text-primary-dark text-4xl" />
                  </div>
                  <h2 className="text-2xl font-bold">{session.user.name}</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaEnvelope className="text-primary-dark mr-3" />
                    <span>{session.user.email}</span>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Link href="/appointment" prefetch={true}>
                      <button className="btn btn-primary w-full flex items-center justify-center bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark">
                        <FaCalendarAlt className="mr-2" />
                        {t('profile.manageAppointments')}
                      </button>
                    </Link>

                    {session.user.role === 'admin' && (
                      <Link href="/admin" prefetch={true}>
                        <button className="btn btn-secondary w-full flex items-center justify-center">
                          <FaUserCog className="mr-2" />
                          {t('admin.title')}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Message and Quick Links */}
            <div className="lg:col-span-2">
              <div className="card p-6 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <h3 className="text-2xl font-bold mb-4">{t('profile.welcome')}, {session.user.name}!</h3>
                <p className="mb-6">{t('profile.welcomeMessage')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/appointment/new" prefetch={true}>
                    <div className="card p-4 bg-primary-light hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                      <h4 className="font-bold mb-2">{t('profile.newAppointment')}</h4>
                      <p className="text-sm">{t('profile.newAppointmentDesc')}</p>
                    </div>
                  </Link>

                  <Link href="/appointment" prefetch={true}>
                    <div className="card p-4 bg-primary-light hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                      <h4 className="font-bold mb-2">{t('profile.viewAppointments')}</h4>
                      <p className="text-sm">{t('profile.viewAppointmentsDesc')}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  console.log('>>> [getServerSideProps /profile] Checking session...');
  const session = await getSession({ req });
  console.log('>>> [getServerSideProps /profile] Session found:', session ? `User: ${session.user?.email}` : 'null');

  if (!session) {
    console.log('>>> [getServerSideProps /profile] No session, redirecting to /...');
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  console.log('>>> [getServerSideProps /profile] Session valid, rendering profile page.');
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fr', ['common'])),
      session,
    },
  };
};