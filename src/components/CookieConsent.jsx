"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gtm_consent";
const BANNER_DISMISSED_KEY = "gtm_consent_dismissed";

export default function CookieConsent({ onAccept } = {}) {
  const [consent, setConsent] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === "true";
    } catch (e) {
      return false;
    }
  });
  const [show, setShow] = useState(() => {
    try {
      // show banner if user has not dismissed or accepted
      return localStorage.getItem(BANNER_DISMISSED_KEY) !== "true" && localStorage.getItem(STORAGE_KEY) !== "true";
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (consent) {
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.setItem(BANNER_DISMISSED_KEY, "true");
        onAccept?.();
      }
    } catch (e) {
      // ignore
    }
  }, [consent, onAccept]);

  const accept = () => setConsent(true);
  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "false");
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch (e) {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed z-50 left-0 right-0 bottom-6 mx-auto max-w-3xl px-6 py-4 rounded-xl shadow-lg bg-white border border-gray-200 flex items-center gap-4">
      <div className="flex-1 text-sm text-gray-700">
        <strong className="font-semibold">Çerez izni</strong>
        <div className="text-sm text-gray-600">Bu site analiz ve performans amacıyla çerez kullanır. Gizlilik politikasını okudum ve kabul ediyorum.</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={decline}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Reddet
        </button>
        <button
          onClick={accept}
          className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}
