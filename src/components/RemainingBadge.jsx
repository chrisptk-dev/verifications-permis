"use client";
import { useEffect, useState } from "react";

export default function RemainingBadge({ storageKey, total, color }) {
  const [remaining, setRemaining] = useState(total);
  const [isPulsing, setIsPulsing] = useState(false); // 👈 pour gérer l’animation

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(storageKey);
        const map = raw ? JSON.parse(raw) : {};
        const known = Object.values(map).filter((v) => v === "known").length;
        setRemaining(Math.max(total - known, 0));
      } catch {
        setRemaining(total);
      }
    };
    read();
    const rerender = () => read();
    window.addEventListener("storage", rerender);
    window.addEventListener("rev-progress", rerender);
    return () => {
      window.removeEventListener("storage", rerender);
      window.removeEventListener("rev-progress", rerender);
    };
  }, [storageKey, total]);

  function handleClick() {
    // 👈 animation brève au clic
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 250);

    // ✅ Renvoie StudyList vers la vue “par défaut”
    window.dispatchEvent(
      new CustomEvent("rev-set-view", {
        detail: { key: storageKey, view: "default" },
      })
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "inline-flex items-center justify-center rounded-full text-[11px] font-semibold",
        "text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-2",
        isPulsing ? "scale-110 shadow-lg" : "scale-100 shadow-sm", // 👈 effet pulse
        "transition-transform duration-200 ease-out",
      ].join(" ")}
      style={{
        backgroundColor: color,
        minWidth: "28px",
        height: "28px",
      }}
      title="Afficher les cartes restantes"
    >
      {remaining}
    </button>
  );
}
