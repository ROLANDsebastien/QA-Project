import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaCalendarTimes, FaUserClock } from 'react-icons/fa';

import Layout from '@/components/Layout';
import ConfirmDialog from '@/components/ConfirmDialog';

type AppointmentWithUser = {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function AdminDashboard() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<AppointmentWithUser[]>([]);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      
      // Extraire le tableau d'appointments de la réponse
      const appointmentsArray = data.appointments || [];
      
      // Transform data to match AppointmentWithUser type
      const formattedData = appointmentsArray.map((appointment: any) => {
        // S'assurer que userId est correctement géré, qu'il soit peuplé ou non
        const userId = appointment.userId || {};
        return {
          id: appointment._id,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
          status: appointment.status,
          user: {
            id: userId._id || '',
            name: userId.name || 'N/A',
            email: userId.email || 'N/A'
          }
        };
      });
      setAppointments(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openStatusDialog = (id: string, status: string) => {
    setStatusUpdateId(id);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateId || !newStatus) return;
    
    try {
      const response = await fetch(`/api/admin/appointments/${statusUpdateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }
      
      // Mettre à jour le rendez-vous dans la liste
      setAppointments(appointments.map(app => 
        app.id === statusUpdateId ? { ...app, status: newStatus } : app
      ));
      
      setStatusUpdateId(null);
      setNewStatus('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsStatusDialogOpen(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('admin.status.confirmed');
      case 'cancelled':
        return t('admin.status.cancelled');
      default:
        return t('admin.status.pending');
    }
  };

  // Si l'utilisateur n'est pas admin, rediriger vers l'accueil
  if (session && session.user.role !== 'admin') {
    router.push('/');
    return null;
  }

  if (!session) {
    return (
      <Layout>
        <Head>
          <title>{t('admin.title')} | FM Compta Consulting</title>
          <meta name="description" content="Administration FM Compta Consulting" />
        </Head>

        <section className="section pt-32">
          <h1 className="section-title">{t('admin.title')}</h1>
          
          <div className="card max-w-md mx-auto text-center p-8 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
            <FaUserClock className="text-primary-dark text-5xl mx-auto mb-4" />
            <p className="mb-6">{t('admin.accessDenied')}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t('admin.title')} | FM Compta Consulting</title>
        <meta name="description" content="Administration FM Compta Consulting" />
      </Head>

      <section className="section pt-32">
        <h1 className="section-title">{t('admin.title')}</h1>
        
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{t('admin.allAppointments')}</h2>
          </div>

          {isLoading ? (
            <div className="card text-center p-8">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>{t('appointment.loading')}</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">{t('admin.client')}</th>
                    <th className="py-3 px-4 text-left">{t('appointment.date')}</th>
                    <th className="py-3 px-4 text-left">{t('appointment.time')}</th>
                    <th className="py-3 px-4 text-left">{t('appointment.reason')}</th>
                    <th className="py-3 px-4 text-left">{t('admin.statusLabel')}</th>
                    <th className="py-3 px-4 text-left">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{appointment.user.name}</p>
                          <p className="text-sm text-gray-500">{appointment.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{appointment.date}</td>
                      <td className="py-3 px-4">{appointment.time}</td>
                      <td className="py-3 px-4">{appointment.reason}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => openStatusDialog(appointment.id, 'confirmed')}
                              className="btn btn-sm bg-green-500 text-white hover:bg-green-600"
                            >
                              {t('admin.confirm')}
                            </button>
                          )}
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => openStatusDialog(appointment.id, 'cancelled')}
                              className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                            >
                              {t('admin.cancel')}
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => openStatusDialog(appointment.id, 'cancelled')}
                              className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                            >
                              {t('admin.cancel')}
                            </button>
                          )}
                          {appointment.status === 'cancelled' && (
                            <button
                              onClick={() => openStatusDialog(appointment.id, 'confirmed')}
                              className="btn btn-sm bg-green-500 text-white hover:bg-green-600"
                            >
                              {t('admin.confirm')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card text-center p-8 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
              <FaCalendarTimes className="text-gray-400 text-5xl mx-auto mb-4" />
              <p>{t('admin.noAppointments')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Boîte de dialogue de confirmation de mise à jour du statut */}
      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleStatusUpdate}
        title={newStatus === 'confirmed' ? t('admin.confirmTitle') : t('admin.cancelTitle')}
        message={newStatus === 'confirmed' ? t('admin.confirmMessage') : t('admin.cancelMessage')}
        confirmText={newStatus === 'confirmed' ? t('admin.confirm') : t('admin.cancel')}
        cancelText={t('common.back')}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const session = await getSession({ req });
  
  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'fr', ['common'])),
    },
  };
};