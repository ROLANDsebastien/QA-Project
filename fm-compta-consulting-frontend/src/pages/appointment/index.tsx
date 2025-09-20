import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr';
import en from 'date-fns/locale/en-US';
import ro from 'date-fns/locale/ro';

import Layout from '@/components/Layout';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Appointment {
  _id: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface AppointmentResponse {
  appointments: Appointment[];
  pagination: PaginationData;
}

export default function Appointment() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const dateLocales = {
    fr: fr,
    en: en,
    ro: ro
  };

  const fetchAppointments = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/appointments?page=${page}&limit=${perPage}`);

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data: AppointmentResponse = await response.json();
      setAppointments(data.appointments);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.pages);
      setPerPage(data.pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    if (session) {
      fetchAppointments(currentPage);
    }
  }, [session, currentPage, fetchAppointments]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setAppointmentToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      // Remove the appointment from the list
      setAppointments(appointments.filter(app => app._id !== appointmentToDelete));
      setAppointmentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-8 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}
        >
          &laquo; {t('common.previous')}
        </button>

        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber: number;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <button
                key={i}
                onClick={() => handlePageChange(pageNumber)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNumber ? 'bg-primary text-white' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}
        >
          {t('common.next')} &raquo;
        </button>
      </div>
    );
  };

  if (!session) {
    return (
      <Layout>
        <Head>
          <title>{t('appointment.title')} | FM Compta Consulting</title>
          <meta name="description" content="Prenez rendez-vous avec FM Compta Consulting" />
        </Head>

        <section className="section pt-32">
          <h1 className="section-title">{t('appointment.title')}</h1>

          <div className="card max-w-md mx-auto text-center p-8 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
            <FaCalendarAlt className="text-primary-dark text-5xl mx-auto mb-4" />
            <p className="mb-6">{t('appointment.login')}</p>
            <Link href="/auth/login">
              <button className="btn btn-primary bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark">
                {t('navbar.login')}
              </button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t('appointment.title')} | FM Compta Consulting</title>
        <meta name="description" content="Prenez rendez-vous avec FM Compta Consulting" />
      </Head>

      <section className="section pt-32">
        <h1 className="section-title">{t('appointment.title')}</h1>

        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{t('appointment.myAppointments')}</h2>
            <Link href="/appointment/new" prefetch={true}>
              <button className="btn btn-primary">
                + {t('appointment.title')}
              </button>
            </Link>
          </div>

          {isLoading ? (
            <div className="card text-center p-8">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>{t('appointment.loading')}</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment: Appointment) => (
                <div key={appointment._id} className="card p-4 mb-4 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                      <p className="font-medium">{format(parseISO(appointment.date), 'PPP', { locale: dateLocales[router.locale as keyof typeof dateLocales] || dateLocales.fr })}</p>
                      <p className="text-gray-600">{appointment.time}</p>
                      <p className="mt-2">{appointment.reason}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {t(`appointment.status.${appointment.status}`)}
                      </span>

                      {appointment.status !== 'cancelled' && (
                        <div className="flex space-x-2">
                          <Link href={`/appointment/edit/${appointment._id}`} prefetch={true}>
                            <button className="btn btn-sm btn-primary">
                              {t('appointment.modify')}
                            </button>
                          </Link>
                          <button
                            onClick={() => openDeleteConfirm(appointment._id)}
                            className="btn bg-red-500 text-white hover:bg-red-600 text-sm"
                          >
                            {t('appointment.cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center p-8 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
              <FaCalendarTimes className="text-gray-400 text-5xl mx-auto mb-4" />
              <p>{t('appointment.noAppointments')}</p>
            </div>
          )}

          <Pagination />
        </div>
      </section>

      {/* Boîte de dialogue de confirmation de suppression de rendez-vous */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleCancelAppointment}
        title={t('appointment.cancelTitle')}
        message={t('appointment.confirmCancel')}
        confirmText={t('appointment.confirmDelete')}
        cancelText={t('appointment.cancel')}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  console.log('[getServerSideProps /appointment] Checking session...'); // Log ajouté
  const session = await getSession({ req });
  console.log('[getServerSideProps /appointment] Session found:', !!session); // Log ajouté

  if (!session) {
    console.log('[getServerSideProps /appointment] No session found, redirecting to /'); // Log ajouté
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
      session,
    },
  };
};