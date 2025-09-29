"use client";
import { useEffect } from "react";

/** Écrit le nombre total de fiches pour un thème.
 *  Clé: rev-total-${slug}
 */
export default function TotalWriter({ slug, total }) {
  useEffect(() => {
    try {
      const key = `rev-total-${slug}`;
      const prev = parseInt(localStorage.getItem(key) || "0", 10);
      if (prev !== total) {
        localStorage.setItem(key, String(total));
        // notifie les écrans (HomeProgress) dans l’onglet courant
        window.dispatchEvent(
          new CustomEvent("rev-total", { detail: { slug, total } })
        );
      }
    } catch {}
  }, [slug, total]);

  return null;
}
