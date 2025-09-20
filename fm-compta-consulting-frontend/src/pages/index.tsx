import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaCalculator,
  FaChartLine,
  FaHandshake,
  FaLightbulb,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import Layout from "@/components/Layout";

export default function Home() {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>FM Compta Consulting</title>
        <meta name="description" content={t("hero.subtitle")} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Section Héros */}
      <section className="hero-section pt-16 pb-12">
        {/* Suppression du lien de test temporaire */}
        {/*
        <div className="container mx-auto px-4 text-center mb-8">
          <a
            href="/redirect?to=/test-page"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Cliquez ici pour tester la navigation
          </a>
          <p className="mt-4 text-sm">Utilisez cette méthode de redirection serveur au lieu de la navigation client</p>
        </div>
        */}

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <AnimateOnScroll
              animation="fade-right"
              className="text-left lg:pr-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark mb-6">
                {t("hero.title")}
              </h1>
              <p className="text-lg md:text-xl mb-8">
                {t("hero.subtitle")}
                FM Compta Consulting vous accompagne dans la gestion de votre
                comptabilité pour une croissance durable et maîtrisée de votre
                entreprise.
              </p>
              <Link href="/appointment">
                <button className="btn btn-primary text-lg px-8 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark">
                  {t("hero.cta")}
                </button>
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fade-left"
              delay={200}
              className="order-first lg:order-last"
            >
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/hero-accounting.jpg"
                  alt="Accounting services"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Section À Propos */}
      <section id="about" className="section py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <AnimateOnScroll animation="fade-up">
            <h2 className="section-title mb-12">{t("about.title")}</h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimateOnScroll animation="fade-up" delay={100}>
              <div className="card text-center p-6 h-64 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <FaCalculator className="text-primary-dark text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {t("about.services.accounting.title")}
                </h3>
                <p className="flex-grow">
                  {t("about.services.accounting.description")}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="card text-center p-6 h-64 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <FaChartLine className="text-primary-dark text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {t("about.services.tax.title")}
                </h3>
                <p className="flex-grow">
                  {t("about.services.tax.description")}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="card text-center p-6 h-64 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <FaHandshake className="text-primary-dark text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {t("about.services.social.title")}
                </h3>
                <p className="flex-grow">
                  {t("about.services.social.description")}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={400}>
              <div className="card text-center p-6 h-64 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <FaLightbulb className="text-primary-dark text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {t("about.services.creation.title")}
                </h3>
                <p className="flex-grow">
                  {t("about.services.creation.description")}
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll animation="fade-up" delay={100}>
            <h3 className="text-2xl font-bold text-center mt-16 mb-8">
              Nos Valeurs
            </h3>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="card text-center p-6 h-52 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <h4 className="text-xl font-bold mb-2">
                  {t("values.expertise.title")}
                </h4>
                <p className="flex-grow">{t("values.expertise.description")}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="card text-center p-6 h-52 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <h4 className="text-xl font-bold mb-2">
                  {t("values.proximity.title")}
                </h4>
                <p className="flex-grow">{t("values.proximity.description")}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={400}>
              <div className="card text-center p-6 h-52 flex flex-col bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <h4 className="text-xl font-bold mb-2">
                  {t("values.innovation.title")}
                </h4>
                <p className="flex-grow">
                  {t("values.innovation.description")}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Section Équipe */}
      <section id="team" className="section py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <AnimateOnScroll animation="fade-up">
            <h2 className="section-title mb-12">{t("team.title")}</h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {/* Felicia */}
            <AnimateOnScroll
              animation="fade-up"
              delay={100}
              className="flex flex-col items-center text-center"
            >
              <div className="card flex flex-col items-center text-center bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <svg
                      className="w-40 h-40 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {t("team.members.felicia.name")}
                </h3>
                <p className="text-primary-dark font-medium mb-1">
                  {t("team.members.felicia.position")}
                </p>
                <p className="text-gray-600 mb-4">
                  {t("team.members.felicia.description")}
                </p>
                <Link href="mailto:admin@fmcompta.be">
                  <button className="btn btn-outline text-sm bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark hover:text-white text-white">
                    {t("team.members.felicia.email")}
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Liudmila */}
            <AnimateOnScroll
              animation="fade-up"
              delay={200}
              className="flex flex-col items-center text-center"
            >
              <div className="card flex flex-col items-center text-center bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <svg
                      className="w-40 h-40 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {t("team.members.liudmila.name")}
                </h3>
                <p className="text-primary-dark font-medium mb-1">
                  {t("team.members.liudmila.position")}
                </p>
                <p className="text-gray-600 mb-4">
                  {t("team.members.liudmila.description")}
                </p>
                <Link href="mailto:admin@fmcompta.be">
                  <button className="btn btn-outline text-sm bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark hover:text-white text-white">
                    {t("team.members.liudmila.email")}
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Aliona */}
            <AnimateOnScroll
              animation="fade-up"
              delay={300}
              className="flex flex-col items-center text-center"
            >
              <div className="card flex flex-col items-center text-center bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <svg
                      className="w-40 h-40 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {t("team.members.aliona.name")}
                </h3>
                <p className="text-primary-dark font-medium mb-1">
                  {t("team.members.aliona.position")}
                </p>
                <p className="text-gray-600 mb-4">
                  {t("team.members.aliona.description")}
                </p>
                <Link href="mailto:admin@fmcompta.be">
                  <button className="btn btn-outline text-sm bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark hover:text-white text-white">
                    {t("team.members.aliona.email")}
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Maria */}
            <AnimateOnScroll
              animation="fade-up"
              delay={400}
              className="flex flex-col items-center text-center"
            >
              <div className="card flex flex-col items-center text-center bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <svg
                      className="w-40 h-40 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {t("team.members.maria.name")}
                </h3>
                <p className="text-primary-dark font-medium mb-1">
                  {t("team.members.maria.position")}
                </p>
                <p className="text-gray-600 mb-4">
                  {t("team.members.maria.description")}
                </p>
                <Link href="mailto:admin@fmcompta.be">
                  <button className="btn btn-outline text-sm bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark hover:text-white text-white">
                    {t("team.members.maria.email")}
                  </button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="section py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <AnimateOnScroll animation="fade-up">
            <h2 className="section-title mb-12">{t("contact.title")}</h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
            <div className="space-y-6">
              <AnimateOnScroll animation="fade-left" delay={100}>
                <div className="card p-6 flex items-start bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                  <FaMapMarkerAlt className="text-primary-dark text-xl mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium">{t("contact.address")}</h4>
                    <p className="text-gray-600">
                      Avenue du château 28, boite 15, 1081 Koekelberg
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fade-left" delay={200}>
                <div className="card p-6 flex items-start bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                  <FaPhone className="text-primary-dark text-xl mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium">{t("contact.phone")}</h4>
                    <p className="text-gray-600">+32 2 123 45 67</p>
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fade-left" delay={300}>
                <div className="card p-6 flex items-start bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                  <FaEnvelope className="text-primary-dark text-xl mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium">{t("contact.email")}</h4>
                    <p className="text-gray-600">admin@fmcompta.be</p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll animation="fade-up" delay={400}>
              <div className="card overflow-hidden bg-white/80 backdrop-blur-xs hover:bg-white/95 transition-all duration-300 border border-white/30 shadow-glass">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5036.521039029309!2d4.311079076698062!3d50.86337657167403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c3e2494d44cd%3A0x94e8d217539e6be1!2sAv.%20du%20Ch%C3%A2teau%2028%2C%201081%20Bruxelles!5e0!3m2!1sfr!2sbe!4v1742022506495!5m2!1sfr!2sbe"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "fr", ["common"])),
    },
  };
};
