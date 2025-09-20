import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaFileAlt } from 'react-icons/fa';

import Layout from '@/components/Layout';

type AppointmentFormData = {
  date: string;
  time: string;
  reason: string;
};

export default function EditAppointment() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/appointments/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch appointment');
      }

      const data = await response.json();
      setFormData({
        date: data.date,
        time: data.time,
        reason: data.reason
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir les créneaux horaires disponibles pour la date sélectionnée
  const getAvailableTimeSlots = () => {
    // Dans une application réelle, cela proviendrait d'une API
    // Pour l'instant, nous retournerons simplement quelques créneaux horaires fixes
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment');
      }

      // Rediriger vers la page des rendez-vous en cas de succès
      router.push('/appointment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculer la date minimale (aujourd'hui)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Calculer la date maximale (3 mois à partir de maintenant)
  const maxDate = new Date(today.setMonth(today.getMonth() + 3)).toISOString().split('T')[0];

  return (
    <Layout>
      <Head>
        <title>{t('appointment.edit')} | FM Compta Consulting</title>
        <meta name="description" content="Modifier votre rendez-vous avec FM Compta Consulting" />
      </Head>

      <section className="section pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="section-title mb-12">{t('appointment.edit')}</h1>

          <div className="max-w-2xl mx-auto">
            <div className="card p-6 bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
              {error && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center p-8">
                  <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>{t('appointment.loading')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('appointment.form.date')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        min={minDate}
                        max={maxDate}
                        value={formData.date}
                        onChange={handleChange}
                        className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('appointment.form.time')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaClock className="text-gray-400" />
                      </div>
                      <select
                        id="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300"
                      >
                        <option value="">{t('appointment.form.selectTime')}</option>
                        {getAvailableTimeSlots().map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('appointment.form.reason')}
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <FaFileAlt className="text-gray-400" />
                      </div>
                      <textarea
                        id="reason"
                        name="reason"
                        required
                        rows={4}
                        value={formData.reason}
                        onChange={handleChange}
                        className="input pl-10 bg-white/80 backdrop-blur-xs focus:bg-white/95 transition-all duration-300 w-full"
                        placeholder={t('appointment.form.reasonPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => router.push('/appointment')}
                      className="flex-1 btn btn-outline"
                    >
                      {t('appointment.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 btn btn-primary flex justify-center items-center bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark"
                    >
                      {isSubmitting ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      ) : null}
                      {t('appointment.form.update')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      // Utiliser l'opérateur de coalescence nulle (??) au lieu de ||
      ...(await serverSideTranslations(locale ?? 'fr', ['common'])),
      session,
    },
  };
};