"use client";
import { useEffect, useState } from "react";

/** Affiche le nombre restant à apprendre (total - connues).
 *  Écoute localStorage + un CustomEvent "rev-progress" pour se rafraîchir instantanément.
 */
export default function RemainingBadge({ storageKey, total, color }) {
  const [remaining, setRemaining] = useState(total);

  function recompute() {
    try {
      const raw = localStorage.getItem(storageKey);
      const map = raw ? JSON.parse(raw) : {};
      let known = 0;
      for (const k of Object.keys(map)) if (map[k] === "known") known++;
      setRemaining(Math.max(0, total - known));
    } catch {
      setRemaining(total);
    }
  }

  useEffect(() => {
    recompute(); // initial
    const onStorage = (e) => {
      if (e.key === storageKey) recompute();
    };
    const onProgress = (e) => {
      if (e?.detail?.key === storageKey) recompute();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("rev-progress", onProgress);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("rev-progress", onProgress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, total]);

  return (
    <span
      title={`${remaining} à apprendre`}
      aria-label={`${remaining} à apprendre`}
      className="inline-flex items-center justify-center rounded-full h-5 min-w-5 px-1 text-[11px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {remaining}
    </span>
  );
}
