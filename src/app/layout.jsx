"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CookieConsentLoader from "../components/CookieConsentLoader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <title>Endonezya Kaşifi - Seyahat ve Evlilik Hizmetleri</title>
        <meta
          name="description"
          content="Endonezya'da unutulmaz seyahat ve evlilik deneyimleri"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta
          name="keywords"
          content="Endonezya, seyahat, evlilik, düğün, tatil, Bali, Jakarta, turizm"
        />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/x-icon"
          href="https://ucarecdn.com/460a1296-ffdf-4978-b234-cdbe28bfc995/-/format/auto/"
        />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="https://ucarecdn.com/460a1296-ffdf-4978-b234-cdbe28bfc995/-/format/auto/"
        />
        <link
          rel="apple-touch-icon"
          href="https://ucarecdn.com/460a1296-ffdf-4978-b234-cdbe28bfc995/-/format/auto/"
        />
        <link
          rel="icon"
          sizes="192x192"
          href="https://ucarecdn.com/460a1296-ffdf-4978-b234-cdbe28bfc995/-/format/auto/"
        />
        <link
          rel="icon"
          sizes="512x512"
          href="https://ucarecdn.com/460a1296-ffdf-4978-b234-cdbe28bfc995/-/format/auto/"
        />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />
        <meta
          httpEquiv="Permissions-Policy"
          content="camera=(), microphone=(), geolocation=()"
        />

        {/* Content Security Policy - updated for current app (removed reCAPTCHA and client EmailJS) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https:; object-src 'none'; frame-src 'self' https://www.youtube.com https://www.instagram.com; connect-src 'self' https:; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
        />

        {/* Removed client-side reCAPTCHA and EmailJS initialization — server will handle email delivery and we do not use reCAPTCHA */}
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        {/* Cookie consent + GTM loader (consent-aware) */}
        <CookieConsentLoader />
      </body>
    </html>
  );
}

// CookieConsentLoader is a client component that mounts the consent banner and loads GTM when accepted
