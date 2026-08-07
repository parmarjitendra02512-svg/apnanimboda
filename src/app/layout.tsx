import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EnvironmentEffects } from "@/components/EnvironmentEffects";
import { SoundProvider } from "@/components/SoundContext";
import Footer from "@/components/Footer";
import SecurityWrapper from "@/components/SecurityWrapper";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SplashScreen from "@/components/SplashScreen";
import NotificationManager from "@/components/NotificationManager";
import PermissionsModal from "@/components/PermissionsModal";
import CookieConsent from "@/components/CookieConsent";
import ErrorTracker from "@/components/ErrorTracker";
import AppUpdater from "@/components/AppUpdater";
import AppInstallPrompt from "@/components/AppInstallPrompt";
const inter = Inter({ subsets: ["latin"] });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://nimboda.in"),
  title: "Apna Nimboda - India's Most Advanced Digital Village Directory",
  description:
    "Welcome to Apna Nimboda (Apnanimboda 343029). The most secure and advanced digital social directory and networking platform for our village. Connect with people, get local news, e-mitra services, and explore Nimboda digitally.",
  keywords:
    "Apna Nimboda, apnanimboda, apna nimboda, Nimboda, Nimboda village, Nimboda 343029, Bhinmal, Jalore, Rajasthan, Nimboda Jalore, Nimboda Bhinmal, Nimboda digital directory, Nimboda social network, Nimboda website",
  authors: [{ name: "Nimboda Admin" }],
  creator: "Nimboda Community",
  publisher: "Apna Nimboda",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Apna Nimboda - Digital Village Network",
    description:
      "Connecting Nimboda (343029), Bhinmal, Jalore, Rajasthan. Get local news, updates, and directory.",
    url: "https://nimboda.in",
    siteName: "Apna Nimboda",
    images: [
      {
        url: "/icon.jpg", // Make sure this image exists in public folder
        width: 800,
        height: 600,
        alt: "Apna Nimboda Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apna Nimboda - Digital Village Network",
    description: "Connecting Nimboda (343029), Bhinmal, Jalore, Rajasthan.",
    images: ["/icon.jpg"],
  },
  verification: {
    google: "your-google-site-verification-id", // User should replace this later
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Apna Nimboda",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          // Instant Auth Redirect
          try {
            if (window.location.pathname === '/' && localStorage.getItem('tanumanu_user')) {
              window.location.replace('/dashboard');
            }
          } catch(e) {}

          // PWA Install Prompt
          window.__deferredPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__deferredPrompt = e;
            window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
          });

          // Service Worker Registration with AUTO-UPDATE
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              try {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  // Auto-update: Check for updates every 30 seconds
                  setInterval(function() {
                    registration.update();
                  }, 30000);

                  // When a new SW is found, auto-activate it
                  registration.addEventListener('updatefound', function() {
                    var newWorker = registration.installing;
                    if (newWorker) {
                      newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          // New update available - Notify UI via event!
                          window.dispatchEvent(new CustomEvent('sw-update-available', { detail: newWorker }));
                        }
                      });
                    }
                  });
                }).catch(function(err) {});

                // When SW takes control, reload page to get fresh content
                var refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                  }
                });

                // Listen for SW messages (new update notification)
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'SW_UPDATED') {
                    if (!refreshing) {
                      refreshing = true;
                      window.location.reload();
                    }
                  }
                });

              } catch(e) {}
            });
          }

          // AUDIO AUTOPLAY UNLOCK - Sound permission for Reels
          // Unlock audio context on first user interaction anywhere on screen
          var audioUnlocked = false;
          function unlockAudio() {
            if (audioUnlocked) return;
            try {
              var ctx = new (window.AudioContext || window.webkitAudioContext)();
              var buf = ctx.createBuffer(1, 1, 22050);
              var src = ctx.createBufferSource();
              src.buffer = buf;
              src.connect(ctx.destination);
              src.start(0);
              ctx.resume().then(function() {
                audioUnlocked = true;
                window.__audioUnlocked = true;
                window.dispatchEvent(new CustomEvent('audio-unlocked'));
              });
            } catch(e) {}
          }

          // Auto-unlock on any touch/click/keydown
          ['touchstart','mousedown','keydown'].forEach(function(event) {
            document.addEventListener(event, unlockAudio, { once: true, passive: true });
          });

          // Performance: Preconnect to external domains
          var preconnects = ['https://fonts.googleapis.com','https://cdn.pixabay.com','https://nimboda-default-rtdb.firebaseio.com'];
          preconnects.forEach(function(url) {
            var link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          });
        `,
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
              }}
            />
          </>
        )}

        <ThemeProvider>
          <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
            {/* Optimized Background Orbs - using pure gradients instead of heavy CSS blur */}
            <div className="fixed top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.15)_0%,transparent_70%)] z-0 pointer-events-none" />
            <div className="fixed top-[10%] right-[-20%] w-[45rem] h-[45rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] z-0 pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[10%] w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)] z-0 pointer-events-none" />

            <EnvironmentEffects />

            <SecurityWrapper>
              <main className="relative z-10 w-full h-full min-h-screen">
                <SoundProvider>
                  <AuthProvider>
                    <PermissionsModal />
                    <AppUpdater />
                    <NotificationManager />
                    <AppInstallPrompt />
                    {children}
                    <Footer />
                    <ErrorTracker />
                    <CookieConsent />
                  </AuthProvider>
                </SoundProvider>
              </main>
            </SecurityWrapper>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
