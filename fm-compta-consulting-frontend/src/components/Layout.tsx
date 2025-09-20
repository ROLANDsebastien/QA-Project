import { useTranslation } from "next-i18next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import { FaGlobe, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";

import LoginForm from "./LoginForm";
const Modal = dynamic(() => import("./Modal"), { ssr: false });
import RegisterForm from "./RegisterForm";
const ConfirmDialog = dynamic(() => import("./ConfirmDialog"), { ssr: false });

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // +++ AJOUT LOG POUR DEBUG RENDER +++
  console.log(
    `>>> Layout RENDER: Status='${status}', Session User Exists=${!!session?.user}, Role=${session?.user?.role}`,
  );
  // +++ FIN AJOUT LOG +++

  useEffect(() => {
    // Ensure router is ready and session status is determined
    if (router.isReady && status !== "loading" && !isRedirecting) {
      const currentPath = router.pathname;

      // --- LOGIQUE DE REDIRECTION AMÉLIORÉE ---
      if (status === "authenticated" && session?.user) {
        const userRole = session.user.role;
        console.log(
          `>>> Layout: Vérification Auth. Rôle: ${userRole}, Chemin: ${currentPath}`,
        );

        // Rediriger l'admin vers /admin s'il n'y est pas déjà
        if (userRole === "admin" && !currentPath.startsWith("/admin")) {
          console.log(
            `>>> Layout: Admin authentifié sur ${currentPath}. Redirection vers /admin...`,
          );
          setIsRedirecting(true);
          router
            .push("/admin")
            .catch((err) => {
              console.error(
                `>>> Layout: Échec redirection (admin check) vers /admin:`,
                err,
              );
            })
            .finally(() => {
              setTimeout(() => setIsRedirecting(false), 300);
            });
        }
        // Rediriger l'utilisateur non-admin DEPUIS LA RACINE ('/') VERS '/profile'
        else if (userRole !== "admin" && currentPath === "/") {
          console.log(
            `>>> Layout: Non-admin authentifié sur /. Redirection vers /profile...`,
          );
          setIsRedirecting(true);
          router
            .push("/profile")
            .catch((err) => {
              console.error(
                `>>> Layout: Échec redirection (root check) vers /profile:`,
                err,
              );
            })
            .finally(() => {
              setTimeout(() => setIsRedirecting(false), 300);
            });
        }
        // Dans les autres cas (admin déjà sur /admin, non-admin sur une autre page), ne rien faire ici.
        else {
          console.log(
            `>>> Layout: Pas de redirection gérée par le Layout sur ce chemin (${currentPath}) pour le rôle ${userRole}.`,
          );
        }
      } else if (status === "unauthenticated") {
        // La redirection des non-authentifiés depuis les pages protégées est gérée par getServerSideProps de ces pages.
        console.log(
          `>>> Layout: Utilisateur non authentifié sur ${currentPath}. Aucune redirection gérée ici.`,
        );
      }
      // --- FIN LOGIQUE AMÉLIORÉE ---
    }
  }, [status, session, router.pathname, router.isReady, isRedirecting, router]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
    setIsLangMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    console.log(">>> Layout: Initiating sign out (manual redirect)...");
    try {
      const data = await signOut({
        redirect: true,
        callbackUrl: "/",
      });
      console.log(">>> Layout: Sign out completed. Data:", data);
    } catch (error) {
      console.error(">>> Layout: Error during sign out:", error);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>FM Compta Consulting</title>
        <meta
          name="description"
          content="FM Compta Consulting - Services comptables"
        />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="navbar py-4 px-6 bg-primary/80 text-white shadow-md sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-primary-light transition-colors duration-300"
          >
            FM Compta Consulting
          </Link>

          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-8">
            {status !== "authenticated" && (
              <>
                <Link href="/" className="navbar-link">
                  {t("navbar.home")}
                </Link>
                <Link
                  href="/#about"
                  className="navbar-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (router.pathname === "/") {
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      router.push("/#about");
                    }
                  }}
                >
                  {t("navbar.about")}
                </Link>
                <Link
                  href="/#team"
                  className="navbar-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (router.pathname === "/") {
                      document
                        .getElementById("team")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      router.push("/#team");
                    }
                  }}
                >
                  {t("navbar.team")}
                </Link>
                <Link
                  href="/#contact"
                  className="navbar-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (router.pathname === "/") {
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      router.push("/#contact");
                    }
                  }}
                >
                  {t("navbar.contact")}
                </Link>
              </>
            )}

            {status === "authenticated" && session && (
              <>
                {session.user.role === "admin" ? (
                  <>
                    <Link href="/admin" className="navbar-link">
                      {t("admin.title")}
                    </Link>
                    <Link href="/admin/calendar" className="navbar-link">
                      {t("admin.calendar")}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="navbar-link">
                      {t("navbar.profile")}
                    </Link>
                    <Link href="/appointment" className="navbar-link">
                      {t("navbar.appointment")}
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center text-white hover:text-primary-light transition-colors duration-300 focus:outline-none bg-primary/30 rounded-md px-3 py-1.5"
              >
                <FaGlobe className="mr-2" />
                <span className="uppercase font-medium">{router.locale}</span>
              </button>

              {isLangMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl py-1 z-50 border border-gray-100 animate-fadeIn overflow-hidden"
                  onMouseEnter={() => setIsLangMenuOpen(true)}
                  onMouseLeave={() =>
                    setTimeout(() => setIsLangMenuOpen(false), 300)
                  }
                >
                  <button
                    onClick={() => changeLanguage("fr")}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium ${router.locale === "fr" ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-primary-light hover:text-primary-dark transition-colors duration-300"}`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium ${router.locale === "en" ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-primary-light hover:text-primary-dark transition-colors duration-300"}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("ru")}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium ${router.locale === "ru" ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-primary-light hover:text-primary-dark transition-colors duration-300"}`}
                  >
                    Русский
                  </button>
                  <button
                    onClick={() => changeLanguage("ro")}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium ${router.locale === "ro" ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-primary-light hover:text-primary-dark transition-colors duration-300"}`}
                  >
                    Română
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  if (status === "authenticated") {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="flex items-center text-white hover:text-primary-light transition-colors duration-300 focus:outline-none bg-primary/30 rounded-md px-3 py-1.5"
              >
                <FaUser className="mr-2" />
                {status === "authenticated" && session?.user?.name ? (
                  <span className="font-medium truncate max-w-[100px]">
                    {session.user.name}
                  </span>
                ) : (
                  <span className="font-medium">{t("navbar.login")}</span>
                )}
              </button>

              {isUserMenuOpen && status === "authenticated" && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl py-1 z-50 border border-gray-100 animate-fadeIn overflow-hidden"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() =>
                    setTimeout(() => setIsUserMenuOpen(false), 300)
                  }
                >
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-300"
                  >
                    <FaSignOutAlt className="inline mr-2 align-text-bottom" />
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-md shadow-lg py-4 z-40 animate-slideDown">
            <div className="container mx-auto px-6 flex flex-col space-y-4">
              {status !== "authenticated" && (
                <>
                  <Link
                    href="/"
                    className="mobile-navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("navbar.home")}
                  </Link>
                  <Link
                    href="/#about"
                    className="mobile-navbar-link"
                    onClick={(e) => {
                      setIsMenuOpen(false);
                    }}
                  >
                    {t("navbar.about")}
                  </Link>
                  <Link
                    href="/#team"
                    className="mobile-navbar-link"
                    onClick={(e) => {
                      setIsMenuOpen(false);
                    }}
                  >
                    {t("navbar.team")}
                  </Link>
                  <Link
                    href="/#contact"
                    className="mobile-navbar-link"
                    onClick={(e) => {
                      setIsMenuOpen(false);
                    }}
                  >
                    {t("navbar.contact")}
                  </Link>
                </>
              )}
              {status === "authenticated" && session && (
                <>
                  {session.user.role === "admin" ? (
                    <>
                      <Link
                        href="/admin"
                        className="mobile-navbar-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("admin.title")}
                      </Link>
                      <Link
                        href="/admin/calendar"
                        className="mobile-navbar-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("admin.calendar")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="mobile-navbar-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("navbar.profile")}
                      </Link>
                      <Link
                        href="/appointment"
                        className="mobile-navbar-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("navbar.appointment")}
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="mobile-navbar-link text-red-400 hover:text-red-300 w-full text-left"
                  >
                    <FaSignOutAlt className="inline mr-2 align-text-bottom" />
                    {t("navbar.logout")}
                  </button>
                </>
              )}
              {status !== "authenticated" && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="mobile-navbar-link w-full text-left"
                >
                  {t("navbar.login")}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-primary-dark text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">FM Compta Consulting</h3>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-1">
                Email: admin@fmcompta.be | Tél: +32 2 123 45 67
              </p>
              <p>Avenue du château 28, boite 15, 1081 Koekelberg</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <p>
              &copy; {new Date().getFullYear()} FM Compta Consulting. Tous
              droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {isLoginModalOpen && (
        <Modal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          title={t("navbar.login")}
        >
          <LoginForm
            onClose={() => setIsLoginModalOpen(false)}
            onSwitchToRegister={() => {
              setIsLoginModalOpen(false);
              setIsRegisterModalOpen(true);
            }}
          />
        </Modal>
      )}
      {isRegisterModalOpen && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title={t("navbar.register")}
        >
          <RegisterForm
            onClose={() => setIsRegisterModalOpen(false)}
            onSwitchToLogin={() => {
              setIsRegisterModalOpen(false);
              setIsLoginModalOpen(true);
            }}
          />
        </Modal>
      )}
      {isLogoutConfirmOpen && (
        <ConfirmDialog
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
          title={t("confirmations.logout.title")}
          message={t("confirmations.logout.message")}
          confirmText={t("confirmations.logout.confirm")}
          cancelText={t("confirmations.logout.cancel")}
        />
      )}
    </div>
  );
};

export default Layout;
