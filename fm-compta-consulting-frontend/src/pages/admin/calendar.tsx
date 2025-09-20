import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

import Layout from '@/components/Layout';

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

export default function AdminCalendar() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<AppointmentWithUser[]>([]);

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

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Analyser les dates de rendez-vous en objets Date pour la comparaison
  const parsedAppointments = useMemo(() => {
    return appointments.map(appointment => ({
      ...appointment,
      parsedDate: new Date(appointment.date)
    }));
  }, [appointments]);

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return parsedAppointments.filter(appointment => 
      isSameDay(new Date(appointment.parsedDate), day)
    );
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
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
          <title>{t('admin.calendar')} | FM Compta Consulting</title>
          <meta name="description" content="Calendrier des rendez-vous - FM Compta Consulting" />
        </Head>

        <section className="section pt-32">
          <h1 className="section-title">{t('admin.calendar')}</h1>
          
          <div className="card max-w-md mx-auto text-center p-8 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
            <FaCalendarAlt className="text-primary-dark text-5xl mx-auto mb-4" />
            <p className="mb-6">{t('admin.accessDenied')}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t('admin.calendar')} | FM Compta Consulting</title>
        <meta name="description" content="Calendrier des rendez-vous - FM Compta Consulting" />
      </Head>

      <section className="section pt-32">
        <h1 className="section-title">{t('admin.calendar')}</h1>
        
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-8">
            <Link href="/admin" className="btn btn-outline flex items-center">
              <FaArrowLeft className="mr-2" /> {t('admin.backToDashboard')}
            </Link>
            <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
            <div className="flex space-x-2">
              <button onClick={prevMonth} className="btn btn-outline">
                <FaArrowLeft />
              </button>
              <button onClick={nextMonth} className="btn btn-outline">
                <FaArrowRight />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="card text-center p-8">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>{t('appointment.loading')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="bg-gray-100 py-2 text-center font-semibold">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Add empty cells for days of the week before the first day of the month */}
                {Array.from({ length: (monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1) }).map((_, index) => (
                  <div key={`empty-${index}`} className="bg-white h-32 p-2"></div>
                ))}
                
                {/* Calendar days */}
                {monthDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  return (
                    <div key={day.toString()} className="bg-white h-32 p-2 overflow-y-auto">
                      <div className="font-semibold mb-1">{format(day, 'd')}</div>
                      {dayAppointments.length > 0 ? (
                        <div className="space-y-1">
                          {dayAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className={`p-1 text-xs rounded text-white ${getStatusColor(appointment.status)}`}
                              title={`${appointment.user.name} - ${appointment.time} - ${appointment.reason}`}
                            >
                              <div className="truncate">{appointment.time}</div>
                              <div className="truncate">{appointment.user.name}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
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