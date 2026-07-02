"use client";

import { useEffect } from "react";

const DB_NAME = "fori-offline";
const DB_VERSION = 1;
const STORES = ["drafts", "offlineQueue"] as const;

function openOfflineDb() {
  if (!("indexedDB" in window)) return;

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    STORES.forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    });
  };
  request.onsuccess = () => {
    request.result.close();
  };
}

export function PwaRuntime() {
  useEffect(() => {
    openOfflineDb();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Prototype runtime should not block rendering if SW registration fails.
      });
    }
  }, []);

  return null;
}
