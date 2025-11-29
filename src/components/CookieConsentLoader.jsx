"use client";

import { useEffect } from "react";
import CookieConsent from "./CookieConsent";

const STORAGE_KEY = "gtm_consent";

function insertGtmScript(gtmId) {
  if (!gtmId) return;
  if (window.__gtm_injected) return;

  // insert gtm script
  const w = window;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(s);

  // noscript iframe
  const existing = document.getElementById('gtm-noscript');
  if (!existing) {
    const noscript = document.createElement('iframe');
    noscript.id = 'gtm-noscript';
    noscript.title = 'gtm-noscript';
    noscript.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    noscript.style.display = 'none';
    noscript.width = '0';
    noscript.height = '0';
    document.body.appendChild(noscript);
  }

  window.__gtm_injected = true;
}

export default function CookieConsentLoader() {
  const gtmId = import.meta.env.VITE_GTM_ID || '';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true' && gtmId) {
        insertGtmScript(gtmId);
      }
    } catch (e) {
      // ignore storage read errors
    }
  }, [gtmId]);

  function onAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}
    if (gtmId) insertGtmScript(gtmId);
  }

  return <CookieConsent onAccept={onAccept} />;
}
